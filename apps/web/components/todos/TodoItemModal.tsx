'use client';

import type {
  CompletionMode,
  EnergyBand,
  Household,
  Recurrence,
  TodoItem,
} from '@family-companion/shared';
import {
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
  TODO_KIND_LABELS,
  assigneeCountDisplay,
  itemOpenClosedLabel,
  perMemberCompletionLabel,
  todoCardPills,
} from '@family-companion/shared';
import { ChipSelector } from '../ChipSelector';
import { Modal } from '../Modal';
import { ItemCardPills } from '../cards/ItemCardPills';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';

export type TodoItemDraft = {
  title: string;
  dueDate: string;
  assignedTo: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: TodoItem['kind'];
  energyHint: EnergyBand;
};

export function todoItemDraftFromItem(todo: TodoItem): TodoItemDraft {
  return {
    title: todo.title,
    dueDate: todo.dueDate ?? '',
    assignedTo: todo.assignedTo ?? [],
    completionMode: todo.completionMode,
    recurrence: todo.recurrence,
    kind: todo.kind,
    energyHint: todo.energyHint ?? 'medium',
  };
}

function toggleAssignee(draft: TodoItemDraft, userId: string): TodoItemDraft {
  const has = draft.assignedTo.includes(userId);
  return {
    ...draft,
    assignedTo: has ? draft.assignedTo.filter((id) => id !== userId) : [...draft.assignedTo, userId],
  };
}

export function TodoItemModal({
  open,
  mode,
  todo,
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
  todo?: TodoItem;
  draft: TodoItemDraft;
  household: Household;
  actorId: string;
  members: Array<{ userId: string; email: string | null }>;
  busy: boolean;
  modalError?: string | null;
  done?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onDraftChange: (draft: TodoItemDraft) => void;
  onSave: () => void;
  onDelete?: () => void;
  onToggleDone?: () => void;
  onEdit?: () => void;
}) {
  const title = mode === 'create' ? 'Neues Todo' : mode === 'edit' ? 'Todo bearbeiten' : todo?.title ?? 'Todo';

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {modalError ? (
        <p className="err" role="alert">
          {modalError}
        </p>
      ) : null}

      {mode === 'view' && todo ? (
        <div className="stack wide">
          <ItemCardPills pills={todoCardPills(todo, { household, actorId })} />
          <EnergyHintBadge band={todo.energyHint ?? 'medium'} />
          <p className="muted small">
            {itemOpenClosedLabel(done ?? false)}
            {todo.completionMode === 'per_member'
              ? ` · ${perMemberCompletionLabel(household, todo.completions)}`
              : ''}
            {' · '}
            {assigneeCountDisplay(household, todo.assignedTo, actorId).label}
            {' · '}
            {RECURRENCE_LABELS[todo.recurrence]}
            {' · '}
            {COMPLETION_MODE_LABELS[todo.completionMode]}
            {' · '}
            {TODO_KIND_LABELS[todo.kind]}
          </p>
          <div className="row-actions">
            <button type="button" className="chip selected" disabled={busy} onClick={onToggleDone}>
              {done ? 'Erledigt' : 'Als erledigt markieren'}
            </button>
            <button type="button" className="btn ghost" disabled={busy} onClick={onEdit}>
              Bearbeiten
            </button>
            {canDelete ? (
              <button type="button" className="btn danger" disabled={busy} onClick={onDelete}>
                Löschen
              </button>
            ) : null}
          </div>
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
            Fälligkeit (optional)
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) => onDraftChange({ ...draft, dueDate: e.target.value })}
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
            options={Object.entries(TODO_KIND_LABELS).map(([value, label]) => ({
              value: value as TodoItem['kind'],
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
          <div className="row-actions">
            <button className="btn" type="submit" disabled={busy}>
              {mode === 'edit' ? 'Speichern' : 'Anlegen'}
            </button>
            <button className="btn ghost" type="button" disabled={busy} onClick={onClose}>
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
