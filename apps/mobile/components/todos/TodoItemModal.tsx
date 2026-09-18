import type {
  CompletionMode,
  EnergyBand,
  Household,
  Recurrence,
  TodoItem,
} from '@family-companion/shared';
import {
  MANDATORY_DAILY_LABEL,
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
  TODO_KIND_LABELS,
  assigneeCountDisplay,
  itemOpenClosedLabel,
  perMemberCompletionLabel,
  todoCardPills,
} from '@family-companion/shared';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { DateTimeField } from '../DateTimeField';
import { ChipRow } from '../ChipRow';
import { Modal } from '../Modal';
import { ModalActionBar } from '../ModalActionBar';
import { ItemCardPills } from '../cards/ItemCardPills';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { useTheme } from '../../lib/theme';

export type TodoItemDraft = {
  title: string;
  dueDate: string;
  assignedTo: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: TodoItem['kind'];
  energyHint: EnergyBand;
  mandatoryDaily?: boolean;
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
    mandatoryDaily: todo.mandatoryDaily,
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
  isPro,
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
  isPro: boolean;
  members: { userId: string; email: string | null }[];
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
  const theme = useTheme();
  const title = mode === 'create' ? 'Neues Todo' : mode === 'edit' ? 'Todo bearbeiten' : todo?.title ?? 'Todo';

  const styles = StyleSheet.create({
    err: { color: theme.rust },
    muted: { color: theme.inkSoft, fontSize: 14 },
    input: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      padding: 12,
      color: theme.ink,
      backgroundColor: theme.paper,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {modalError ? <Text style={styles.err}>{modalError}</Text> : null}

      {mode === 'view' && todo ? (
        <View style={{ gap: 12 }}>
          <ItemCardPills pills={todoCardPills(todo, { household, actorId })} />
          <EnergyHintBadge band={todo.energyHint ?? 'medium'} />
          <Text style={styles.muted}>
            {itemOpenClosedLabel(done ?? false)}
            {todo.completionMode === 'per_member'
              ? ` · ${perMemberCompletionLabel(household, todo.completions)}`
              : ''}
            {' · '}
            {assigneeCountDisplay(household, todo.assignedTo, actorId).label}
          </Text>
          <ModalActionBar
            mode="view"
            done={done}
            busy={busy}
            canDelete={canDelete}
            primaryLabel="Bearbeiten"
            deleteLabel="Todo löschen"
            onToggleDone={onToggleDone}
            onPrimary={onEdit}
            onDelete={onDelete}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <TextInput
            style={styles.input}
            placeholder="Titel"
            placeholderTextColor={theme.inkFaint}
            value={draft.title}
            onChangeText={(value) => onDraftChange({ ...draft, title: value })}
          />
          <DateTimeField
            label="Fälligkeit (optional)"
            mode="date"
            value={draft.dueDate}
            optional
            onChange={(dueDate) => onDraftChange({ ...draft, dueDate })}
            onClear={() => onDraftChange({ ...draft, dueDate: '' })}
          />
          {members.map((member) => (
            <View key={member.userId} style={styles.row}>
              <Text style={styles.muted}>{member.email ?? 'E-Mail unbekannt'}</Text>
              <Switch
                value={draft.assignedTo.includes(member.userId)}
                onValueChange={() => onDraftChange(toggleAssignee(draft, member.userId))}
              />
            </View>
          ))}
          <ChipRow
            label="Wiederholung"
            value={draft.recurrence}
            options={Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({
              value: value as Recurrence,
              label,
            }))}
            onChange={(recurrence) =>
              onDraftChange({
                ...draft,
                recurrence,
                mandatoryDaily:
                  draft.kind === 'habit' && recurrence === 'daily' ? draft.mandatoryDaily : undefined,
              })
            }
          />
          <ChipRow
            label="Erledigung"
            value={draft.completionMode}
            options={Object.entries(COMPLETION_MODE_LABELS).map(([value, label]) => ({
              value: value as CompletionMode,
              label,
            }))}
            onChange={(completionMode) => onDraftChange({ ...draft, completionMode })}
          />
          <ChipRow
            label="Art"
            value={draft.kind}
            options={Object.entries(TODO_KIND_LABELS).map(([value, label]) => ({
              value: value as TodoItem['kind'],
              label,
            }))}
            onChange={(kind) =>
              onDraftChange({
                ...draft,
                kind,
                mandatoryDaily: kind === 'habit' && draft.recurrence === 'daily' ? draft.mandatoryDaily : undefined,
              })
            }
          />
          {isPro && draft.kind === 'habit' && draft.recurrence === 'daily' ? (
            <View style={styles.row}>
              <Text style={styles.muted}>{MANDATORY_DAILY_LABEL}</Text>
              <Switch
                value={draft.mandatoryDaily === true}
                onValueChange={(value) =>
                  onDraftChange({ ...draft, mandatoryDaily: value ? true : undefined })
                }
              />
            </View>
          ) : null}
          <ChipRow
            label="Energie"
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
            deleteLabel="Todo löschen"
            onToggleDone={mode === 'edit' ? onToggleDone : undefined}
            onPrimary={onSave}
            onCancel={onClose}
            onDelete={onDelete}
          />
        </View>
      )}
    </Modal>
  );
}
