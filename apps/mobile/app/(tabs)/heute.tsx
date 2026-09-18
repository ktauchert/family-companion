import type {
  CalendarEvent,
  DayPlanItem,
  HeuteAreaSummary,
  Household,
  MorningCheckIn,
  MorningCheckInBand,
  PrioritizationSuggestion,
  ShoppingItem,
  ShoppingList,
  TodoItem,
} from '@family-companion/shared';
import {
  applySuggestionToEvent,
  applySuggestionToTodo,
  buildHeuteAreaSummaries,
  dayPlanItemTarget,
  ENERGY_CHECK_IN_OPTIONS,
  energyBandToValue,
  ensureMemberEmail,
  isCalendarEventDoneForUser,
  isTodoDoneForUser,
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
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AreaSummaryCards } from '../../components/heute/AreaSummaryCards';
import { ProTeaserCards } from '../../components/heute/ProTeaserCards';
import { CheckInChip } from '../../components/heute/CheckInChip';
import { DayPlanItemCard } from '../../components/heute/DayPlanItemCard';
import { SuggestionCard } from '../../components/heute/SuggestionCard';
import { calendar } from '../../lib/calendar';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { morning } from '../../lib/morning';
import { shopping } from '../../lib/shopping';
import { shoppingLists } from '../../lib/shoppingLists';
import { todos } from '../../lib/todos';
import { useTheme } from '../../lib/theme';

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

export default function HeuteScreen() {
  const router = useRouter();
  const theme = useTheme();
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

  const today = localDateString();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      void households.householdForUser(user.uid).then(async (found) => {
        if (!found) {
          router.replace('/onboarding');
          return;
        }
        const withEmail = ensureMemberEmail(found, { userId: user.uid, email: user.email ?? '' });
        setHousehold(withEmail);
      });
    });
  }, [router]);

  useEffect(() => {
    if (!household) return;
    const unsubCheckIns = morning.subscribeForHouseholdOnDate(household.id, today, setCheckIns);
    const unsubEvents = calendar.subscribeForHousehold(household.id, setEvents);
    const unsubTodos = todos.subscribeForHousehold(household.id, setTodoItems);
    const unsubShopping = shopping.subscribeForHousehold(household.id, setShoppingItems);
    const unsubLists = shoppingLists.subscribeForHousehold(
      household.id,
      (next) => {
        setShoppingListsState(next);
        if (!uid) return;
        void (async () => {
          const missing = missingDefaultShoppingLists(next, {
            householdId: household.id,
            createdBy: uid,
            createdAt: new Date().toISOString(),
          });
          if (missing.length === 0) return;
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

  const actorCheckIn = useMemo(
    () => checkIns.find((entry) => entry.userId === uid) ?? null,
    [checkIns, uid],
  );

  const plan = useMemo(() => {
    if (!household || !uid) return { items: [], suggestions: [] };
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
    if (!household || !uid) return [];
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

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    heading: { fontSize: 20, fontFamily: 'Georgia', color: theme.ink },
    muted: { color: theme.inkSoft },
    small: { color: theme.inkSoft, fontSize: 14 },
    stamp: { fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.inkFaint },
    err: { color: theme.rust },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: {
      flexGrow: 1,
      flexBasis: '30%',
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      backgroundColor: theme.paper,
    },
    chipSelected: { borderColor: theme.sage, backgroundColor: theme.well },
    chipText: { color: theme.inkSoft, fontSize: 15 },
    chipTextSelected: { color: theme.ink, fontWeight: '600' },
    btn: { backgroundColor: theme.sage, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    btnText: { color: theme.paper, fontWeight: '600' },
    stack: { gap: 12 },
    dayPlanStack: { gap: 10 },
  });

  async function saveCheckIn() {
    if (!household || !uid || actorCheckIn) return;
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
    if (!household || !uid) return;
    setBusy(true);
    setError(null);
    try {
      if (suggestion.targetKind === 'event') {
        const event = events.find((item) => item.id === suggestion.targetId);
        if (!event) return;
        const next = applySuggestionToEvent(event, suggestion, today);
        const result = prepareUpdateCalendarEvent({
          actorId: uid,
          household,
          event,
          patch: { startsAt: next.startsAt, endsAt: next.endsAt, assignedTo: next.assignedTo },
        });
        if (!result.ok) {
          setError('Vorschlag konnte nicht angewendet werden.');
          return;
        }
        await calendar.saveEvent(result.event);
      } else {
        const todo = todoItems.find((item) => item.id === suggestion.targetId);
        if (!todo) return;
        const next = applySuggestionToTodo(todo, suggestion);
        const result = prepareUpdateTodo({
          actorId: uid,
          household,
          todo,
          patch: { dueDate: next.dueDate, assignedTo: next.assignedTo },
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
    if (!household || !uid) return;
    setTogglingId(item.id);
    setError(null);
    try {
      const doneAt = new Date().toISOString();
      if (item.kind === 'event') {
        const event = events.find((entry) => entry.id === item.id);
        if (!event) return;
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
        if (!todo) return;
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

  function openSummary(summary: HeuteAreaSummary) {
    router.push(summary.mobilePath as '/kalender');
  }

  if (!household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Guten Tag</Text>
          <Text style={styles.stamp}>{household.plan}</Text>
        </View>
        <Text style={styles.muted}>{household.name}</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {actorCheckIn ? <CheckInChip checkIns={checkIns} household={household} /> : null}

        {!actorCheckIn ? (
          <View style={styles.stack}>
            <Text style={styles.heading}>Morgen-Check-in</Text>
            <Text style={styles.small}>Stimmung</Text>
            <View style={styles.chipRow}>
              {MOOD_CHECK_IN_OPTIONS.map((option) => {
                const selected = moodBand === option.band;
                return (
                  <Pressable
                    key={option.band}
                    disabled={busy}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setMoodBand(option.band)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.small}>Energie</Text>
            <View style={styles.chipRow}>
              {ENERGY_CHECK_IN_OPTIONS.map((option) => {
                const selected = energyBand === option.band;
                return (
                  <Pressable
                    key={option.band}
                    disabled={busy}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setEnergyBand(option.band)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.btn} disabled={busy} onPress={() => void saveCheckIn()}>
              <Text style={styles.btnText}>Check-in speichern</Text>
            </Pressable>
          </View>
        ) : null}

        {visibleSuggestions.length > 0 ? (
          <View style={styles.stack}>
            <Text style={styles.heading}>Vorschläge</Text>
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
          </View>
        ) : null}

        <Text style={styles.heading}>Dein Tag</Text>
        {plan.items.length === 0 ? (
          <Text style={styles.muted}>Keine offenen Termine, Todos oder Einkäufe für heute.</Text>
        ) : (
          <View style={styles.dayPlanStack}>
            {plan.items.map((item) => (
              <DayPlanItemCard
                key={`${item.kind}_${item.id}`}
                item={item}
                household={household}
                done={isDayPlanItemDone(item, events, todoItems, uid)}
                toggling={togglingId === item.id}
                onPress={() => router.push(dayPlanItemTarget(item).mobilePath as '/kalender')}
                onToggleDone={() => void toggleDayPlanItem(item)}
              />
            ))}
          </View>
        )}
      </View>

      <AreaSummaryCards summaries={areaSummaries} onPressSummary={openSummary} />
      {household.plan === 'free' ? (
        <ProTeaserCards onActivate={() => router.push('/einstellungen')} />
      ) : null}
    </ScrollView>
  );
}
