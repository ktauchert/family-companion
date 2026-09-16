'use client';

import type {
  CalendarEvent,
  CompletionMode,
  EnergyBand,
  Household,
  Recurrence,
} from '@family-companion/shared';
import {
  CALENDAR_KIND_LABELS,
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
  assigneeCountDisplay,
  eventCardPills,
  formatCalendarEventRange,
  itemOpenClosedLabel,
  perMemberCompletionLabel,
  toDatetimeLocalValue,
} from '@family-companion/shared';
import { ChipSelector } from '../ChipSelector';
import { Modal } from '../Modal';
import { ModalActionBar } from '../ModalActionBar';
import { ItemCardPills } from '../cards/ItemCardPills';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';

export type CalendarEventDraft = {
  title: string;
  startsAtLocal: string;
  endsAtLocal: string;
  assignedTo: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: CalendarEvent['kind'];
  energyHint: EnergyBand;
};

export function calendarEventDraftFromEvent(event: CalendarEvent): CalendarEventDraft {
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

function toggleAssignee(draft: CalendarEventDraft, userId: string): CalendarEventDraft {
  const has = draft.assignedTo.includes(userId);
  return {
    ...draft,
    assignedTo: has ? draft.assignedTo.filter((id) => id !== userId) : [...draft.assignedTo, userId],
  };
}

export function CalendarEventModal({
  open,
  mode,
  event,
  draft,
  household,
  actorId,
  members,
  busy,
  modalError,
  done,
  canDelete,
  onClose,
  onDraftChange,
  onSave,
  onDelete,
  onToggleDone,
  onEdit,
}: {
  open: boolean;
  mode: 'view' | 'edit' | 'create';
  event?: CalendarEvent;
  draft: CalendarEventDraft;
  household: Household;
  actorId: string;
  members: Array<{ userId: string; email: string | null }>;
  busy: boolean;
  modalError?: string | null;
  done?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onDraftChange: (draft: CalendarEventDraft) => void;
  onSave: () => void;
  onDelete?: () => void;
  onToggleDone?: () => void;
  onEdit?: () => void;
}) {
  const title =
    mode === 'create' ? 'Neuer Termin' : mode === 'edit' ? 'Termin bearbeiten' : event?.title ?? 'Termin';

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {modalError ? (
        <p className="err" role="alert">
          {modalError}
        </p>
      ) : null}

      {mode === 'view' && event ? (
        <div className="stack wide">
          <p className="modal-lead">{formatCalendarEventRange(event.startsAt, event.endsAt)}</p>
          <ItemCardPills pills={eventCardPills(event, { household, actorId })} />
          <EnergyHintBadge band={event.energyHint ?? 'medium'} />
          <p className="muted small">
            {itemOpenClosedLabel(done ?? false)}
            {event.completionMode === 'per_member'
              ? ` · ${perMemberCompletionLabel(household, event.completions)}`
              : ''}
            {' · '}
            {assigneeCountDisplay(household, event.assignedTo, actorId).label}
            {' · '}
            {RECURRENCE_LABELS[event.recurrence]}
            {' · '}
            {COMPLETION_MODE_LABELS[event.completionMode]}
            {' · '}
            {CALENDAR_KIND_LABELS[event.kind]}
          </p>
          <ModalActionBar
            mode="view"
            done={done}
            busy={busy}
            canDelete={canDelete}
            primaryLabel="Bearbeiten"
            deleteLabel="Termin löschen"
            onToggleDone={onToggleDone}
            onPrimary={onEdit}
            onDelete={onDelete}
          />
        </div>
      ) : (
        <form
          className="stack wide"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            onSave();
          }}
        >
          <label className="field">
            Titel
            <input
              value={draft.title}
              onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
              required
            />
          </label>
          <label className="field">
            Beginn
            <input
              type="datetime-local"
              value={draft.startsAtLocal}
              onChange={(e) => onDraftChange({ ...draft, startsAtLocal: e.target.value })}
              required
            />
          </label>
          <label className="field">
            Ende (optional)
            <input
              type="datetime-local"
              value={draft.endsAtLocal}
              onChange={(e) => onDraftChange({ ...draft, endsAtLocal: e.target.value })}
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
                  onChange={() => onDraftChange(toggleAssignee(draft, member.userId))}
                />
                {member.email ?? 'E-Mail unbekannt'}
                {member.userId === actorId ? ' · du' : ''}
              </label>
            ))}
          </fieldset>
          <ChipSelector
            label="Wiederholung"
            value={draft.recurrence}
            options={Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
              value: value as Recurrence,
              label,
            }))}
            onChange={(recurrence) => onDraftChange({ ...draft, recurrence })}
          />
          <ChipSelector
            label="Erledigung"
            value={draft.completionMode}
            options={Object.entries(COMPLETION_MODE_LABELS).map(([value, label]) => ({
              value: value as CompletionMode,
              label,
            }))}
            onChange={(completionMode) => onDraftChange({ ...draft, completionMode })}
          />
          <ChipSelector
            label="Art"
            value={draft.kind}
            options={Object.entries(CALENDAR_KIND_LABELS).map(([value, label]) => ({
              value: value as CalendarEvent['kind'],
              label,
            }))}
            onChange={(kind) => onDraftChange({ ...draft, kind })}
          />
          <ChipSelector
            label="Energie-Hinweis"
            value={draft.energyHint}
            options={Object.entries(ENERGY_HINT_LABELS).map(([value, label]) => ({
              value: value as EnergyBand,
              label,
            }))}
            onChange={(energyHint) => onDraftChange({ ...draft, energyHint })}
          />
          <ModalActionBar
            mode={mode}
            done={done}
            busy={busy}
            canDelete={canDelete}
            primaryLabel={mode === 'edit' ? 'Speichern' : 'Anlegen'}
            deleteLabel="Termin löschen"
            primaryType="submit"
            onToggleDone={mode === 'edit' ? onToggleDone : undefined}
            onCancel={onClose}
            onDelete={onDelete}
          />
        </form>
      )}
    </Modal>
  );
}
