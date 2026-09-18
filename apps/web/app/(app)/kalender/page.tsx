'use client';

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
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../../components/Chrome';
import { PlusIconButton } from '../../../components/PlusIconButton';
import {
  CalendarEventModal,
  calendarEventDraftFromEvent,
  type CalendarEventDraft,
} from '../../../components/kalender/CalendarEventModal';
import { CalendarWeekView } from '../../../components/kalender/CalendarWeekView';
import { calendar } from '../../../lib/calendar';
import { auth } from '../../../lib/firebase';
import { households } from '../../../lib/households';

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

export default function KalenderPage() {
  const router = useRouter();
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
  }, [router]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return calendar.subscribeForHousehold(
      household.id,
      (next) => {
        setEvents([...next].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      },
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

  async function deleteEvent() {
    if (!household || !uid || !selectedEvent) {
      return;
    }
    if (!canDeleteCalendarEvent({ actorId: uid, household, event: selectedEvent })) {
      return;
    }
    if (!window.confirm(`„${selectedEvent.title}" löschen?`)) {
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      await calendar.deleteEvent(selectedEvent.id);
      closeModal();
    } catch (err) {
      console.error('[calendar delete]', err);
      setModalError(messageFromStoreError(err, 'Termin konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
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
      <Chrome crumb="Kalender">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  const modalMode = modal?.mode === 'edit' ? 'edit' : modal?.mode === 'create' ? 'create' : 'view';
  const modalOpen = modal !== null;

  return (
    <Chrome crumb="Kalender" current="kalender">
      <div className="cards wide">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Kalender</h1>
            <PlusIconButton label="Neuer Termin" onClick={openCreate} />
          </header>
          <hr className="rule" />
          {error ? (
            <p className="err" role="alert">
              {error}
            </p>
          ) : null}

          <div className="week-nav" aria-label="Kalenderwoche">
            <button
              type="button"
              className="icon-btn"
              aria-label="Vorherige Woche"
              onClick={() => setWeekAnchor((current) => shiftWeekAnchor(current, -1))}
            >
              ←
            </button>
            <span className="week-nav-label">{week.headerLabel}</span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Nächste Woche"
              onClick={() => setWeekAnchor((current) => shiftWeekAnchor(current, 1))}
            >
              →
            </button>
          </div>

          <CalendarWeekView
            week={week}
            events={events}
            household={household}
            actorId={uid}
            onSelectEvent={openView}
          />
        </article>
      </div>

      <CalendarEventModal
        open={modalOpen}
        mode={modalMode}
        event={selectedEvent}
        draft={draft}
        household={household}
        actorId={uid}
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
        onDelete={() => void deleteEvent()}
        onToggleDone={() => void toggleDone()}
        onEdit={() => {
          if (selectedEvent) {
            setModal({ mode: 'edit', eventId: selectedEvent.id });
            setDraft(calendarEventDraftFromEvent(selectedEvent));
          }
        }}
      />
    </Chrome>
  );
}
