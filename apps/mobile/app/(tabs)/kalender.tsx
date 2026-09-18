import type { CalendarEvent, Household } from '@family-companion/shared';
import {
  canDeleteCalendarEvent,
  createCalendarEventErrorMessage,
  defaultStartsAtLocal,
  ensureMemberEmail,
  fromDatetimeLocalValue,
  householdMembers,
  isCalendarEventDoneForUser,
  localDateString,
  messageFromStoreError,
  newEntityId,
  prepareCreateCalendarEvent,
  prepareToggleCalendarEventCompletion,
  prepareUpdateCalendarEvent,
  shiftWeekAnchor,
  weekRange,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlusFab } from '../../components/Modal';
import {
  CalendarEventModal,
  calendarEventDraftFromEvent,
  type CalendarEventDraft,
} from '../../components/kalender/CalendarEventModal';
import { CalendarWeekView } from '../../components/kalender/CalendarWeekView';
import { calendar } from '../../lib/calendar';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { useTheme } from '../../lib/theme';

type ModalState =
  | null
  | { mode: 'create' }
  | { mode: 'view'; eventId: string }
  | { mode: 'edit'; eventId: string };

function emptyDraft(): CalendarEventDraft {
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

export default function KalenderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(() => localDateString());
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<CalendarEventDraft>(emptyDraft);

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
  const week = useMemo(() => weekRange(weekAnchor), [weekAnchor]);
  const selectedEvent = useMemo(
    () => (modal && modal.mode !== 'create' ? events.find((event) => event.id === modal.eventId) : undefined),
    [events, modal],
  );

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, paddingBottom: 120, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    rule: { width: 48, height: 1, backgroundColor: theme.rule },
    muted: { color: theme.inkSoft },
    err: { color: theme.rust },
    weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    weekLabel: { flex: 1, textAlign: 'center', fontFamily: 'Georgia', fontSize: 16, color: theme.ink },
    navBtn: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.well,
    },
    navBtnText: { color: theme.ink, fontSize: 16 },
  });

  function closeModal() {
    setModal(null);
    setModalError(null);
    setDraft(emptyDraft());
  }

  function openCreate() {
    setDraft(emptyDraft());
    setModal({ mode: 'create' });
    setModalError(null);
  }

  function openView(event: CalendarEvent) {
    setDraft(calendarEventDraftFromEvent(event));
    setModal({ mode: 'view', eventId: event.id });
    setModalError(null);
  }

  async function saveEvent() {
    if (!household || !uid || !modal) {
      return;
    }
    if (!draft.title.trim()) {
      setModalError(createCalendarEventErrorMessage('title_required'));
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      const startsAt = fromDatetimeLocalValue(draft.startsAtLocal);
      const endsAt = draft.endsAtLocal ? fromDatetimeLocalValue(draft.endsAtLocal) : undefined;
      const assignedTo = draft.assignedTo.length > 0 ? draft.assignedTo : undefined;

      if (modal.mode === 'edit') {
        const existing = events.find((item) => item.id === modal.eventId);
        if (!existing) {
          setModalError('Termin nicht gefunden.');
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
            mandatoryDaily: draft.mandatoryDaily,
          },
        });
        if (!result.ok) {
          setModalError(createCalendarEventErrorMessage(result.reason));
          return;
        }
        await calendar.saveEvent(result.event);
      } else {
        const result = prepareCreateCalendarEvent({
          actorId: uid,
          household,
          eventId: newEntityId('evt'),
          title: draft.title,
          startsAt,
          endsAt,
          assignedTo,
          completionMode: draft.completionMode,
          recurrence: draft.recurrence,
          kind: draft.kind,
          energyHint: draft.energyHint,
          mandatoryDaily: draft.mandatoryDaily,
        });
        if (!result.ok) {
          setModalError(createCalendarEventErrorMessage(result.reason));
          return;
        }
        await calendar.createEvent(result.event);
      }
      closeModal();
    } catch (err) {
      console.error('[calendar save]', err);
      setModalError(messageFromStoreError(err, 'Termin konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  function deleteEvent() {
    if (!household || !uid || !selectedEvent) {
      return;
    }
    if (!canDeleteCalendarEvent({ actorId: uid, household, event: selectedEvent })) {
      return;
    }
    Alert.alert('Löschen', `„${selectedEvent.title}" löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          void calendar
            .deleteEvent(selectedEvent.id)
            .then(() => closeModal())
            .catch((err) => {
              console.error('[calendar delete]', err);
              setModalError(messageFromStoreError(err, 'Termin konnte nicht gelöscht werden.'));
            })
            .finally(() => setBusy(false));
        },
      },
    ]);
  }

  async function toggleDone() {
    if (!household || !uid || !selectedEvent) {
      return;
    }
    const done = !isCalendarEventDoneForUser(selectedEvent, uid);
    const result = prepareToggleCalendarEventCompletion({
      actorId: uid,
      household,
      event: selectedEvent,
      done,
      doneAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setModalError(createCalendarEventErrorMessage(result.reason));
      return;
    }
    setBusy(true);
    try {
      await calendar.saveEvent(result.event);
    } catch (err) {
      console.error('[calendar toggle]', err);
      setModalError(messageFromStoreError(err, 'Erledigung konnte nicht gespeichert werden.'));
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

  const modalMode = modal?.mode === 'edit' ? 'edit' : modal?.mode === 'create' ? 'create' : 'view';

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Kalender</Text>
          <View style={styles.rule} />
          {error ? <Text style={styles.err}>{error}</Text> : null}

          <View style={styles.weekNav}>
            <Pressable
              style={styles.navBtn}
              accessibilityLabel="Vorherige Woche"
              onPress={() => setWeekAnchor((current) => shiftWeekAnchor(current, -1))}
            >
              <Text style={styles.navBtnText}>←</Text>
            </Pressable>
            <Text style={styles.weekLabel}>{week.headerLabel}</Text>
            <Pressable
              style={styles.navBtn}
              accessibilityLabel="Nächste Woche"
              onPress={() => setWeekAnchor((current) => shiftWeekAnchor(current, 1))}
            >
              <Text style={styles.navBtnText}>→</Text>
            </Pressable>
          </View>

          <CalendarWeekView
            week={week}
            events={events}
            household={household}
            actorId={uid}
            onSelectEvent={openView}
          />
        </View>
      </ScrollView>

      <PlusFab label="Neuer Termin" onPress={openCreate} />

      <CalendarEventModal
        open={modal !== null}
        mode={modalMode}
        event={selectedEvent}
        draft={draft}
        household={household}
        actorId={uid}
        isPro={household.plan === 'pro'}
        members={members}
        busy={busy}
        modalError={modalError}
        done={selectedEvent ? isCalendarEventDoneForUser(selectedEvent, uid) : false}
        canDelete={
          selectedEvent ? canDeleteCalendarEvent({ actorId: uid, household, event: selectedEvent }) : false
        }
        onClose={closeModal}
        onDraftChange={setDraft}
        onSave={() => void saveEvent()}
        onDelete={deleteEvent}
        onToggleDone={() => void toggleDone()}
        onEdit={() => {
          if (selectedEvent) {
            setModal({ mode: 'edit', eventId: selectedEvent.id });
            setDraft(calendarEventDraftFromEvent(selectedEvent));
          }
        }}
      />
    </View>
  );
}
