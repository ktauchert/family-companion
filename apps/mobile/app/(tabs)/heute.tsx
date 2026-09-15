import type {
  CalendarEvent,
  DayPlanItem,
  Household,
  MorningCheckIn,
  MorningCheckInBand,
  PrioritizationSuggestion,
  ShoppingItem,
  TodoItem,
} from '@family-companion/shared';
import {
  applySuggestionToEvent,
  applySuggestionToTodo,
  calendarAssigneeLabel,
  ENERGY_CHECK_IN_OPTIONS,
  energyBandToValue,
  ensureMemberEmail,
  formatCalendarEventRange,
  ENERGY_HINT_LABELS,
  formatDueDate,
  householdMemberLabel,
  localDateString,
  messageFromStoreError,
  MOOD_CHECK_IN_OPTIONS,
  moodBandToValue,
  morningCheckInErrorMessage,
  morningCheckInId,
  prepareCreateMorningCheckIn,
  prepareUpdateCalendarEvent,
  prepareUpdateTodo,
  prioritizeDay,
  SHOPPING_CATEGORY_LABELS,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { calendar } from '../../lib/calendar';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { morning } from '../../lib/morning';
import { shopping } from '../../lib/shopping';
import { todos } from '../../lib/todos';
import { useTheme } from '../../lib/theme';

function dayPlanKindLabel(item: DayPlanItem): string {
  if (item.kind === 'event') {
    return 'Termin';
  }
  if (item.kind === 'shopping') {
    return 'Einkauf';
  }
  return 'Todo';
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
  const [moodBand, setMoodBand] = useState<MorningCheckInBand>('mid');
  const [energyBand, setEnergyBand] = useState<MorningCheckInBand>('mid');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    return () => {
      unsubCheckIns();
      unsubEvents();
      unsubTodos();
      unsubShopping();
    };
  }, [household, today]);

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
    });
  }, [household, uid, today, checkIns, events, todoItems, shoppingItems]);

  const visibleSuggestions = plan.suggestions.filter((s) => !dismissed.has(s.id));

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
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
    btnText: { color: theme.paper },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    ghostText: { color: theme.ink },
    row: { gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.rule },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  });

  async function saveCheckIn() {
    if (!household || !uid || actorCheckIn) return;
    const moodValue = moodBandToValue(moodBand);
    const energyValue = energyBandToValue(energyBand);
    setBusy(true);
    setError(null);
    try {
      const result = prepareCreateMorningCheckIn({
        actorId: uid,
        household,
        checkInId: morningCheckInId(household.id, uid, today),
        mood: moodValue,
        energy: energyValue,
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
        <Text style={styles.title}>Guten Tag</Text>
        <Text style={styles.muted}>{household.name}</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {!actorCheckIn ? (
          <>
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
              <Text style={styles.btnText}>Speichern</Text>
            </Pressable>
          </>
        ) : null}

        {visibleSuggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.row}>
            <Text style={styles.muted}>{suggestion.message}</Text>
            {suggestion.suggestedAssignee ? (
              <Text style={styles.small}>
                {householdMemberLabel(household.memberEmails?.[suggestion.suggestedAssignee] ?? null)}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable style={styles.btn} disabled={busy} onPress={() => void confirmSuggestion(suggestion)}>
                <Text style={styles.btnText}>Bestätigen</Text>
              </Pressable>
              <Pressable
                style={styles.ghost}
                disabled={busy}
                onPress={() => setDismissed((prev) => new Set(prev).add(suggestion.id))}
              >
                <Text style={styles.ghostText}>Ablehnen</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.heading}>Dein Tag</Text>
        {plan.items.length === 0 ? (
          <Text style={styles.muted}>Keine offenen Termine, Todos oder Einkäufe für heute.</Text>
        ) : (
          plan.items.map((item) => (
            <View key={`${item.kind}_${item.id}`} style={styles.row}>
              <Text style={styles.stamp}>{dayPlanKindLabel(item)}</Text>
              <Text style={styles.heading}>{item.title}</Text>
              {item.shoppingCategory ? (
                <Text style={styles.small}>{SHOPPING_CATEGORY_LABELS[item.shoppingCategory]}</Text>
              ) : null}
              {item.startsAt ? <Text style={styles.small}>{formatCalendarEventRange(item.startsAt)}</Text> : null}
              {item.dueDate ? <Text style={styles.small}>Fällig {formatDueDate(item.dueDate)}</Text> : null}
              {item.kind !== 'shopping' ? (
                <Text style={styles.small}>
                  {ENERGY_HINT_LABELS[item.energyHint]}
                  {item.assignedTo && item.assignedTo.length > 0
                    ? ` · ${calendarAssigneeLabel(household, item.assignedTo)}`
                    : ''}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
