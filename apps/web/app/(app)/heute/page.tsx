'use client';

import type {
  CalendarEvent,
  DayPlanItem,
  Household,
  MorningCheckIn,
  MorningCheckInBand,
  OpenMandatoryHabit,
  PrioritizationSuggestion,
  ShoppingItem,
  ShoppingList,
  TodoItem,
  UserPreferences,
} from '@family-companion/shared';
import {
  applySuggestionToEvent,
  applySuggestionToTodo,
  buildHeuteAreaSummaries,
  ENERGY_CHECK_IN_OPTIONS,
  energyBandToValue,
  ensureMemberEmail,
  evaluateKaizenNudge,
  isCalendarEventDoneForUser,
  isKaizenNudgesEnabled,
  isTodoDoneForUser,
  listOpenMandatoryHabitsForUser,
  localDateString,
  messageFromStoreError,
  missingDefaultShoppingLists,
  MOOD_CHECK_IN_OPTIONS,
  moodBandToValue,
  morningCheckInErrorMessage,
  morningCheckInId,
  prepareCreateMorningCheckIn,
  prepareToggleCalendarEventCompletion,
  prepareToggleTodoCompletion,
  prepareUpdateCalendarEvent,
  prepareUpdateTodo,
  prioritizeDay,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../../components/Chrome';
import { AreaSummaryCards } from '../../../components/heute/AreaSummaryCards';
import { KaizenNudgeCard } from '../../../components/heute/KaizenNudgeCard';
import { MandatoryHabitsSection } from '../../../components/heute/MandatoryHabitsSection';
import { ProTeaserCards } from '../../../components/heute/ProTeaserCards';
import { CheckInChip } from '../../../components/heute/CheckInChip';
import { DayPlanItemCard } from '../../../components/heute/DayPlanItemCard';
import { SuggestionCard } from '../../../components/heute/SuggestionCard';
import { calendar } from '../../../lib/calendar';
import { auth } from '../../../lib/firebase';
import { households } from '../../../lib/households';
import { morning } from '../../../lib/morning';
import { shopping } from '../../../lib/shopping';
import { shoppingLists } from '../../../lib/shoppingLists';
import { todos } from '../../../lib/todos';
import { userPreferences } from '../../../lib/userPreferences';

function isDayPlanItemDone(
  item: DayPlanItem,
  events: CalendarEvent[],
  todoItems: TodoItem[],
  actorId: string,
): boolean {
  if (item.kind === 'event') {
    const event = events.find((entry) => entry.id === item.id);
    return event ? isCalendarEventDoneForUser(event, actorId) : false;
  }
  if (item.kind === 'todo') {
    const todo = todoItems.find((entry) => entry.id === item.id);
    return todo ? isTodoDoneForUser(todo, actorId) : false;
  }
  return false;
}

export default function HeutePage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<MorningCheckIn[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [shoppingListsState, setShoppingListsState] = useState<ShoppingList[]>([]);
  const [moodBand, setMoodBand] = useState<MorningCheckInBand>('mid');
  const [energyBand, setEnergyBand] = useState<MorningCheckInBand>('mid');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  const today = localDateString();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      const withEmail = ensureMemberEmail(found, {
        userId: user.uid,
        email: user.email ?? '',
      });
      setHousehold(
        withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]
          ? await households.saveHousehold(withEmail).catch(() => found).then(() => withEmail)
          : found,
      );
    });
  }, [router]);

  useEffect(() => {
    if (!household) {
      return;
    }
    const unsubCheckIns = morning.subscribeForHouseholdOnDate(household.id, today, setCheckIns);
    const unsubEvents = calendar.subscribeForHousehold(household.id, setEvents);
    const unsubTodos = todos.subscribeForHousehold(household.id, setTodoItems);
    const unsubShopping = shopping.subscribeForHousehold(household.id, setShoppingItems);
    const unsubLists = shoppingLists.subscribeForHousehold(
      household.id,
      (next) => {
        setShoppingListsState(next);
        if (!uid) {
          return;
        }
        void (async () => {
          const missing = missingDefaultShoppingLists(next, {
            householdId: household.id,
            createdBy: uid,
            createdAt: new Date().toISOString(),
          });
          if (missing.length === 0) {
            return;
          }
          try {
            await Promise.all(missing.map((list) => shoppingLists.createList(list)));
          } catch {
            setError('Standard-Listen konnten nicht angelegt werden.');
          }
        })();
      },
    );
    return () => {
      unsubCheckIns();
      unsubEvents();
      unsubTodos();
      unsubShopping();
      unsubLists();
    };
  }, [household, today, uid]);

  useEffect(() => {
    if (!uid) {
      return;
    }
    return userPreferences.subscribeForUser(uid, setPrefs);
  }, [uid]);

  const openMandatoryHabits = useMemo(() => {
    if (!uid || household?.plan !== 'pro') {
      return [];
    }
    return listOpenMandatoryHabitsForUser({
      actorId: uid,
      date: today,
      events,
      todos: todoItems,
    });
  }, [household?.plan, uid, today, events, todoItems]);

  const kaizenNudge = useMemo(() => {
    if (!household || !uid) {
      return null;
    }
    return evaluateKaizenNudge({
      household,
      actorId: uid,
      date: today,
      now,
      events,
      todos: todoItems,
      kaizenNudgesEnabled: isKaizenNudgesEnabled(prefs ?? undefined),
    });
  }, [household, uid, today, now, events, todoItems, prefs]);

  const actorCheckIn = useMemo(
    () => checkIns.find((entry) => entry.userId === uid) ?? null,
    [checkIns, uid],
  );

  const plan = useMemo(() => {
    if (!household || !uid) {
      return { items: [], suggestions: [] };
    }
    return prioritizeDay({
      household,
      actorId: uid,
      date: today,
      checkIns,
      events,
      todos: todoItems,
      shoppingItems,
      shoppingLists: shoppingListsState,
    });
  }, [household, uid, today, checkIns, events, todoItems, shoppingItems, shoppingListsState]);

  const areaSummaries = useMemo(() => {
    if (!household || !uid) {
      return [];
    }
    const summaries = buildHeuteAreaSummaries({
      household,
      actorId: uid,
      date: today,
      events,
      todos: todoItems,
      shoppingItems,
    });
    return [summaries.kalender, summaries.todos, summaries.listen];
  }, [household, uid, today, events, todoItems, shoppingItems]);

  const visibleSuggestions = plan.suggestions.filter((s) => !dismissed.has(s.id));

  async function saveCheckIn() {
    if (!household || !uid || actorCheckIn) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = prepareCreateMorningCheckIn({
        actorId: uid,
        household,
        checkInId: morningCheckInId(household.id, uid, today),
        mood: moodBandToValue(moodBand),
        energy: energyBandToValue(energyBand),
        date: today,
        existingForUserOnDate: actorCheckIn,
      });
      if (!result.ok) {
        setError(morningCheckInErrorMessage(result.reason));
        return;
      }
      await morning.createCheckIn(result.checkIn);
    } catch (err) {
      setError(messageFromStoreError(err, 'Check-in konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function confirmSuggestion(suggestion: PrioritizationSuggestion) {
    if (!household || !uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (suggestion.targetKind === 'event') {
        const event = events.find((item) => item.id === suggestion.targetId);
        if (!event) {
          return;
        }
        const next = applySuggestionToEvent(event, suggestion, today);
        const result = prepareUpdateCalendarEvent({
          actorId: uid,
          household,
          event,
          patch: {
            startsAt: next.startsAt,
            endsAt: next.endsAt,
            assignedTo: next.assignedTo,
          },
        });
        if (!result.ok) {
          setError('Vorschlag konnte nicht angewendet werden.');
          return;
        }
        await calendar.saveEvent(result.event);
      } else {
        const todo = todoItems.find((item) => item.id === suggestion.targetId);
        if (!todo) {
          return;
        }
        const next = applySuggestionToTodo(todo, suggestion);
        const result = prepareUpdateTodo({
          actorId: uid,
          household,
          todo,
          patch: {
            dueDate: next.dueDate,
            assignedTo: next.assignedTo,
          },
        });
        if (!result.ok) {
          setError('Vorschlag konnte nicht angewendet werden.');
          return;
        }
        await todos.saveTodo(result.todo);
      }
      setDismissed((prev) => new Set(prev).add(suggestion.id));
    } catch (err) {
      setError(messageFromStoreError(err, 'Vorschlag konnte nicht angewendet werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleDayPlanItem(item: DayPlanItem) {
    if (!household || !uid) {
      return;
    }
    setTogglingId(item.id);
    setError(null);
    try {
      const doneAt = new Date().toISOString();
      if (item.kind === 'event') {
        const event = events.find((entry) => entry.id === item.id);
        if (!event) {
          return;
        }
        const done = isCalendarEventDoneForUser(event, uid);
        const result = prepareToggleCalendarEventCompletion({
          actorId: uid,
          household,
          event,
          done: !done,
          doneAt,
        });
        if (!result.ok) {
          setError('Erledigt-Status konnte nicht geändert werden.');
          return;
        }
        await calendar.saveEvent(result.event);
      } else if (item.kind === 'todo') {
        const todo = todoItems.find((entry) => entry.id === item.id);
        if (!todo) {
          return;
        }
        const done = isTodoDoneForUser(todo, uid);
        const result = prepareToggleTodoCompletion({
          actorId: uid,
          household,
          todo,
          done: !done,
          doneAt,
        });
        if (!result.ok) {
          setError('Erledigt-Status konnte nicht geändert werden.');
          return;
        }
        await todos.saveTodo(result.todo);
      }
    } catch (err) {
      setError(messageFromStoreError(err, 'Erledigt-Status konnte nicht geändert werden.'));
    } finally {
      setTogglingId(null);
    }
  }

  if (!household || !uid) {
    return (
      <Chrome crumb="Heute">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb="Heute" current="heute">
      <div className="heute-layout">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Guten Tag</h1>
            <span className="stamp">{household.plan}</span>
          </header>
          <hr className="rule" />
          <p className="muted">{household.name}</p>
          {error ? <p className="err" role="alert">{error}</p> : null}

          {actorCheckIn ? <CheckInChip checkIns={checkIns} household={household} /> : null}

          {!actorCheckIn ? (
            <section className="stack">
              <h2>Morgen-Check-in</h2>
              <div className="stack">
                <p className="muted">Stimmung</p>
                <div className="chip-row" role="group" aria-label="Stimmung">
                  {MOOD_CHECK_IN_OPTIONS.map((option) => (
                    <button
                      key={option.band}
                      type="button"
                      className={`chip${moodBand === option.band ? ' selected' : ''}`}
                      disabled={busy}
                      onClick={() => setMoodBand(option.band)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="stack">
                <p className="muted">Energie</p>
                <div className="chip-row" role="group" aria-label="Energie">
                  {ENERGY_CHECK_IN_OPTIONS.map((option) => (
                    <button
                      key={option.band}
                      type="button"
                      className={`chip${energyBand === option.band ? ' selected' : ''}`}
                      disabled={busy}
                      onClick={() => setEnergyBand(option.band)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn" type="button" disabled={busy} onClick={() => void saveCheckIn()}>
                Check-in speichern
              </button>
            </section>
          ) : null}

          {openMandatoryHabits.length > 0 ? (
            <MandatoryHabitsSection
              habits={openMandatoryHabits}
              events={events}
              todos={todoItems}
              household={household}
              togglingId={togglingId}
              isDone={(habit) => {
                if (habit.targetKind === 'event') {
                  const event = events.find((entry) => entry.id === habit.id);
                  return event ? isCalendarEventDoneForUser(event, uid) : false;
                }
                const todo = todoItems.find((entry) => entry.id === habit.id);
                return todo ? isTodoDoneForUser(todo, uid) : false;
              }}
              onToggleDone={(habit) =>
                void toggleDayPlanItem({ kind: habit.targetKind, id: habit.id, title: habit.title, energyHint: 'medium' })
              }
            />
          ) : null}

          {kaizenNudge ? <KaizenNudgeCard nudge={kaizenNudge} /> : null}

          {visibleSuggestions.length > 0 ? (
            <section className="stack">
              <h2>Vorschläge</h2>
              {visibleSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  household={household}
                  busy={busy}
                  onConfirm={() => void confirmSuggestion(suggestion)}
                  onDismiss={() => setDismissed((prev) => new Set(prev).add(suggestion.id))}
                />
              ))}
            </section>
          ) : null}

          <section className="stack">
            <h2>Dein Tag</h2>
            {plan.items.length === 0 ? (
              <p className="muted">Keine offenen Termine, Todos oder Einkäufe für heute.</p>
            ) : (
              <div className="day-plan-stack">
                {plan.items.map((item) => (
                  <DayPlanItemCard
                    key={`${item.kind}_${item.id}`}
                    item={item}
                    household={household}
                    done={isDayPlanItemDone(item, events, todoItems, uid)}
                    toggling={togglingId === item.id}
                    onToggleDone={() => void toggleDayPlanItem(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </article>

        <AreaSummaryCards summaries={areaSummaries} />
        {household.plan === 'free' ? <ProTeaserCards settingsPath="/einstellungen" /> : null}
      </div>
    </Chrome>
  );
}
