import type { CalendarEvent, CompletionMode, EnergyBand, Household, Recurrence } from '@family-companion/shared';
import {
  CALENDAR_KIND_LABELS,
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
  calendarAssigneeLabel,
  itemOpenClosedLabel,
  perMemberCompletionLabel,
  canDeleteCalendarEvent,
  createCalendarEventErrorMessage,
  defaultStartsAtLocal,
  ensureMemberEmail,
  formatCalendarEventRange,
  fromDatetimeLocalValue,
  householdMembers,
  isCalendarEventDoneForUser,
  messageFromStoreError,
  prepareCreateCalendarEvent,
  prepareToggleCalendarEventCompletion,
  prepareUpdateCalendarEvent,
  toDatetimeLocalValue,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { calendar } from '../../lib/calendar';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { useTheme } from '../../lib/theme';

type EventDraft = {
  title: string;
  startsAtLocal: string;
  endsAtLocal: string;
  assignedTo: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: CalendarEvent['kind'];
  energyHint: EnergyBand;
};

function emptyDraft(): EventDraft {
  return {
    title: '',
    startsAtLocal: defaultStartsAtLocal(),
    endsAtLocal: '',
    assignedTo: [],
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    energyHint: 'medium',
  };
}

function draftFromEvent(event: CalendarEvent): EventDraft {
  return {
    title: event.title,
    startsAtLocal: toDatetimeLocalValue(event.startsAt),
    endsAtLocal: event.endsAt ? toDatetimeLocalValue(event.endsAt) : '',
    assignedTo: event.assignedTo ?? [],
    completionMode: event.completionMode,
    recurrence: event.recurrence,
    kind: event.kind,
    energyHint: event.energyHint ?? 'medium',
  };
}

function toggleAssignee(draft: EventDraft, userId: string): EventDraft {
  const has = draft.assignedTo.includes(userId);
  return {
    ...draft,
    assignedTo: has ? draft.assignedTo.filter((id) => id !== userId) : [...draft.assignedTo, userId],
  };
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `evt_${Date.now()}`;
}

export default function KalenderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);

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
        const withEmail = ensureMemberEmail(found, {
          userId: user.uid,
          email: user.email ?? '',
        });
        if (withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]) {
          try {
            await households.saveHousehold(withEmail);
            setHousehold(withEmail);
          } catch (err) {
            console.error('[member email]', err);
            setHousehold(found);
          }
          return;
        }
        setHousehold(found);
      });
    });
  }, [router]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return calendar.subscribeForHousehold(
      household.id,
      (next) => setEvents([...next].sort((a, b) => a.startsAt.localeCompare(b.startsAt))),
      (err) => {
        console.error('[calendar subscribe]', err);
        setError('Kalender konnte nicht geladen werden.');
      },
    );
  }, [household]);

  const members = useMemo(
    () => (household ? householdMembers(household) : []),
    [household],
  );

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: {
      backgroundColor: theme.sheet,
      borderRadius: 20,
      padding: 22,
      gap: 12,
    },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    heading: { fontSize: 18, fontFamily: 'Georgia', color: theme.ink },
    rule: { width: 48, height: 1, backgroundColor: theme.rule },
    muted: { color: theme.inkSoft },
    small: { color: theme.inkSoft, fontSize: 14 },
    err: { color: theme.rust },
    input: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      padding: 12,
      color: theme.ink,
      backgroundColor: theme.paper,
    },
    btn: {
      backgroundColor: theme.sage,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    btnText: { color: theme.paper },
    ghost: {
      backgroundColor: theme.well,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    ghostText: { color: theme.ink },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    eventRow: {
      gap: 6,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    done: { textDecorationLine: 'line-through', color: theme.inkFaint },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  });

  function resetForm() {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function saveEvent() {
    if (!household || !uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const startsAt = fromDatetimeLocalValue(draft.startsAtLocal);
      const endsAt = draft.endsAtLocal ? fromDatetimeLocalValue(draft.endsAtLocal) : undefined;
      const assignedTo = draft.assignedTo.length > 0 ? draft.assignedTo : undefined;

      if (editingId) {
        const existing = events.find((item) => item.id === editingId);
        if (!existing) {
          setError('Termin nicht gefunden.');
          return;
        }
        const result = prepareUpdateCalendarEvent({
          actorId: uid,
          household,
          event: existing,
          patch: {
            title: draft.title,
            startsAt,
            endsAt,
            assignedTo,
            completionMode: draft.completionMode,
            recurrence: draft.recurrence,
            kind: draft.kind,
            energyHint: draft.energyHint,
          },
        });
        if (!result.ok) {
          setError(createCalendarEventErrorMessage(result.reason));
          return;
        }
        await calendar.saveEvent(result.event);
      } else {
        const result = prepareCreateCalendarEvent({
          actorId: uid,
          household,
          eventId: randomId(),
          title: draft.title,
          startsAt,
          endsAt,
          assignedTo,
          completionMode: draft.completionMode,
          recurrence: draft.recurrence,
          kind: draft.kind,
          energyHint: draft.energyHint,
        });
        if (!result.ok) {
          setError(createCalendarEventErrorMessage(result.reason));
          return;
        }
        await calendar.createEvent(result.event);
      }
      resetForm();
    } catch (err) {
      console.error('[calendar save]', err);
      setError(messageFromStoreError(err, 'Termin konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  function removeEvent(event: CalendarEvent) {
    if (!household || !uid) {
      return;
    }
    if (!canDeleteCalendarEvent({ actorId: uid, household, event })) {
      return;
    }
    Alert.alert('Löschen', `„${event.title}" löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          void calendar
            .deleteEvent(event.id)
            .catch((err) => {
              console.error('[calendar delete]', err);
              setError(messageFromStoreError(err, 'Termin konnte nicht gelöscht werden.'));
            })
            .finally(() => setBusy(false));
        },
      },
    ]);
  }

  async function toggleDone(event: CalendarEvent) {
    if (!household || !uid) {
      return;
    }
    const done = !isCalendarEventDoneForUser(event, uid);
    const result = prepareToggleCalendarEventCompletion({
      actorId: uid,
      household,
      event,
      done,
      doneAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(createCalendarEventErrorMessage(result.reason));
      return;
    }
    setBusy(true);
    try {
      await calendar.saveEvent(result.event);
    } catch (err) {
      console.error('[calendar toggle]', err);
      setError(messageFromStoreError(err, 'Erledigung konnte nicht gespeichert werden.'));
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
        <View style={styles.row}>
          <Text style={styles.title}>Kalender</Text>
          {!showForm ? (
            <Pressable style={styles.btn} onPress={() => setShowForm(true)}>
              <Text style={styles.btnText}>Neu</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.rule} />
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {showForm ? (
          <View style={{ gap: 10 }}>
            <Text style={styles.heading}>{editingId ? 'Bearbeiten' : 'Neuer Termin'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Titel"
              placeholderTextColor={theme.inkFaint}
              value={draft.title}
              onChangeText={(title) => setDraft({ ...draft, title })}
            />
            <Text style={styles.small}>Beginn (YYYY-MM-DDTHH:mm)</Text>
            <TextInput
              style={styles.input}
              value={draft.startsAtLocal}
              onChangeText={(startsAtLocal) => setDraft({ ...draft, startsAtLocal })}
            />
            <Text style={styles.small}>Ende optional</Text>
            <TextInput
              style={styles.input}
              value={draft.endsAtLocal}
              onChangeText={(endsAtLocal) => setDraft({ ...draft, endsAtLocal })}
            />
            <Text style={styles.small}>Zuweisung (leer = Haushalt)</Text>
            {members.map((member) => (
              <View key={member.userId} style={styles.row}>
                <Text style={styles.muted}>
                  {member.email ?? 'E-Mail unbekannt'}
                  {member.userId === uid ? ' · du' : ''}
                </Text>
                <Switch
                  value={draft.assignedTo.includes(member.userId)}
                  onValueChange={() => setDraft(toggleAssignee(draft, member.userId))}
                />
              </View>
            ))}
            <Text style={styles.small}>Wiederholung: {RECURRENCE_LABELS[draft.recurrence]}</Text>
            <View style={styles.actions}>
              {(['none', 'daily', 'weekly'] as Recurrence[]).map((value) => (
                <Pressable
                  key={value}
                  style={styles.ghost}
                  onPress={() => setDraft({ ...draft, recurrence: value })}
                >
                  <Text style={styles.ghostText}>{RECURRENCE_LABELS[value]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.small}>Erledigung: {COMPLETION_MODE_LABELS[draft.completionMode]}</Text>
            <View style={styles.actions}>
              {(['household', 'per_member'] as CompletionMode[]).map((value) => (
                <Pressable
                  key={value}
                  style={styles.ghost}
                  onPress={() => setDraft({ ...draft, completionMode: value })}
                >
                  <Text style={styles.ghostText}>{COMPLETION_MODE_LABELS[value]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.small}>Energie: {ENERGY_HINT_LABELS[draft.energyHint]}</Text>
            <View style={styles.actions}>
              {(['low', 'medium', 'high'] as EnergyBand[]).map((value) => (
                <Pressable
                  key={value}
                  style={styles.ghost}
                  onPress={() => setDraft({ ...draft, energyHint: value })}
                >
                  <Text style={styles.ghostText}>{ENERGY_HINT_LABELS[value]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.small}>Art: {CALENDAR_KIND_LABELS[draft.kind]}</Text>
            <View style={styles.actions}>
              {(['event', 'habit'] as CalendarEvent['kind'][]).map((value) => (
                <Pressable key={value} style={styles.ghost} onPress={() => setDraft({ ...draft, kind: value })}>
                  <Text style={styles.ghostText}>{CALENDAR_KIND_LABELS[value]}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.btn} disabled={busy} onPress={() => void saveEvent()}>
                <Text style={styles.btnText}>{editingId ? 'Speichern' : 'Anlegen'}</Text>
              </Pressable>
              <Pressable style={styles.ghost} disabled={busy} onPress={resetForm}>
                <Text style={styles.ghostText}>Abbrechen</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {events.length === 0 ? (
          <Text style={styles.muted}>Noch keine Termine.</Text>
        ) : (
          events.map((event) => {
            const done = isCalendarEventDoneForUser(event, uid);
            const canDelete = canDeleteCalendarEvent({ actorId: uid, household, event });
            return (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.row}>
                  <Switch value={done} disabled={busy} onValueChange={() => void toggleDone(event)} />
                  <Text style={[styles.heading, done ? styles.done : undefined]}>{event.title}</Text>
                </View>
                <Text style={styles.small}>{formatCalendarEventRange(event.startsAt, event.endsAt)}</Text>
                <Text style={styles.small}>
                  {itemOpenClosedLabel(done)}
                  {event.completionMode === 'per_member'
                    ? ` · ${perMemberCompletionLabel(household, event.completions)}`
                    : ''}
                  {' · '}
                  {calendarAssigneeLabel(household, event.assignedTo)} · {RECURRENCE_LABELS[event.recurrence]} ·{' '}
                  {COMPLETION_MODE_LABELS[event.completionMode]} · {ENERGY_HINT_LABELS[event.energyHint ?? 'medium']}
                  {event.kind === 'habit' ? ` · ${CALENDAR_KIND_LABELS.habit}` : ''}
                </Text>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.ghost}
                    disabled={busy}
                    onPress={() => {
                      setDraft(draftFromEvent(event));
                      setEditingId(event.id);
                      setShowForm(true);
                    }}
                  >
                    <Text style={styles.ghostText}>Bearbeiten</Text>
                  </Pressable>
                  {canDelete ? (
                    <Pressable style={styles.ghost} disabled={busy} onPress={() => removeEvent(event)}>
                      <Text style={styles.ghostText}>Löschen</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
