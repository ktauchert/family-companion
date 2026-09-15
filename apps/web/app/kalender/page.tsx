'use client';

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
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { calendar } from '../../lib/calendar';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';

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

export default function KalenderPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);

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
        setEvents(
          [...next].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
        );
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

  function resetForm() {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  function startCreate() {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function startEdit(event: CalendarEvent) {
    setDraft(draftFromEvent(event));
    setEditingId(event.id);
    setShowForm(true);
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
          eventId: crypto.randomUUID(),
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

  async function removeEvent(event: CalendarEvent) {
    if (!household || !uid) {
      return;
    }
    if (
      !canDeleteCalendarEvent({
        actorId: uid,
        household,
        event,
      })
    ) {
      return;
    }
    if (!window.confirm(`„${event.title}" löschen?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await calendar.deleteEvent(event.id);
    } catch (err) {
      console.error('[calendar delete]', err);
      setError(messageFromStoreError(err, 'Termin konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
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
      <Chrome crumb="Kalender">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb="Kalender" current="kalender">
      <div className="cards wide">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Kalender</h1>
            {!showForm ? (
              <button className="btn" type="button" onClick={startCreate}>
                Neuer Termin
              </button>
            ) : null}
          </header>
          <hr className="rule" />
          {error ? (
            <p className="err" role="alert">
              {error}
            </p>
          ) : null}

          {showForm ? (
            <form
              className="stack wide"
              onSubmit={(event) => {
                event.preventDefault();
                void saveEvent();
              }}
            >
              <label className="field">
                Titel
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Beginn
                <input
                  type="datetime-local"
                  value={draft.startsAtLocal}
                  onChange={(e) => setDraft({ ...draft, startsAtLocal: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Ende (optional)
                <input
                  type="datetime-local"
                  value={draft.endsAtLocal}
                  onChange={(e) => setDraft({ ...draft, endsAtLocal: e.target.value })}
                />
              </label>
              <fieldset className="field">
                <legend>Zuweisung</legend>
                <p className="muted small">Leer = ganzer Haushalt</p>
                {members.map((member) => (
                  <label className="check-row" key={member.userId}>
                    <input
                      type="checkbox"
                      checked={draft.assignedTo.includes(member.userId)}
                      onChange={() => setDraft(toggleAssignee(draft, member.userId))}
                    />
                    {member.email ?? 'E-Mail unbekannt'}
                    {member.userId === uid ? ' · du' : ''}
                  </label>
                ))}
              </fieldset>
              <label className="field">
                Wiederholung
                <select
                  value={draft.recurrence}
                  onChange={(e) => setDraft({ ...draft, recurrence: e.target.value as Recurrence })}
                >
                  {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Erledigung
                <select
                  value={draft.completionMode}
                  onChange={(e) =>
                    setDraft({ ...draft, completionMode: e.target.value as CompletionMode })
                  }
                >
                  {Object.entries(COMPLETION_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Art
                <select
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value as CalendarEvent['kind'] })}
                >
                  {Object.entries(CALENDAR_KIND_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Energie-Hinweis
                <select
                  value={draft.energyHint}
                  onChange={(e) => setDraft({ ...draft, energyHint: e.target.value as EnergyBand })}
                >
                  {Object.entries(ENERGY_HINT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="row-actions">
                <button className="btn" type="submit" disabled={busy}>
                  {editingId ? 'Speichern' : 'Anlegen'}
                </button>
                <button className="btn ghost" type="button" disabled={busy} onClick={resetForm}>
                  Abbrechen
                </button>
              </div>
            </form>
          ) : null}

          {events.length === 0 ? (
            <p className="muted">Noch keine Termine.</p>
          ) : (
            <ul className="plain-list event-list">
              {events.map((event) => {
                const done = isCalendarEventDoneForUser(event, uid);
                const canDelete = canDeleteCalendarEvent({ actorId: uid, household, event });
                return (
                  <li className="event-row" key={event.id}>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={busy}
                        onChange={() => void toggleDone(event)}
                      />
                      <span className={done ? 'done' : undefined}>{event.title}</span>
                    </label>
                    <p className="muted small">
                      {formatCalendarEventRange(event.startsAt, event.endsAt)}
                    </p>
                    <p className="muted small">
                      {itemOpenClosedLabel(done)}
                      {event.completionMode === 'per_member'
                        ? ` · ${perMemberCompletionLabel(household, event.completions)}`
                        : ''}
                      {' · '}
                      {calendarAssigneeLabel(household, event.assignedTo)} ·{' '}
                      {RECURRENCE_LABELS[event.recurrence]} · {COMPLETION_MODE_LABELS[event.completionMode]}
                      {' · '}
                      {ENERGY_HINT_LABELS[event.energyHint ?? 'medium']}
                      {event.kind === 'habit' ? ` · ${CALENDAR_KIND_LABELS.habit}` : ''}
                    </p>
                    <div className="row-actions">
                      <button className="btn ghost" type="button" disabled={busy} onClick={() => startEdit(event)}>
                        Bearbeiten
                      </button>
                      {canDelete ? (
                        <button
                          className="btn ghost"
                          type="button"
                          disabled={busy}
                          onClick={() => void removeEvent(event)}
                        >
                          Löschen
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </div>
    </Chrome>
  );
}
