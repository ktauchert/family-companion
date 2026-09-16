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
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { ChipRow } from '../ChipRow';
import { Modal } from '../Modal';
import { ItemCardPills } from '../cards/ItemCardPills';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { useTheme } from '../../lib/theme';

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
  members: { userId: string; email: string | null }[];
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
  const theme = useTheme();
  const title =
    mode === 'create' ? 'Neuer Termin' : mode === 'edit' ? 'Termin bearbeiten' : event?.title ?? 'Termin';

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
    btn: { backgroundColor: theme.sage, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    btnText: { color: theme.paper },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    ghostText: { color: theme.ink },
    danger: { borderWidth: 1, borderColor: theme.rust, backgroundColor: 'transparent' },
    dangerText: { color: theme.rust },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  });

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {modalError ? <Text style={styles.err}>{modalError}</Text> : null}

      {mode === 'view' && event ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.muted}>{formatCalendarEventRange(event.startsAt, event.endsAt)}</Text>
          <ItemCardPills pills={eventCardPills(event, { household, actorId })} />
          <EnergyHintBadge band={event.energyHint ?? 'medium'} />
          <Text style={styles.muted}>
            {itemOpenClosedLabel(done ?? false)}
            {event.completionMode === 'per_member'
              ? ` · ${perMemberCompletionLabel(household, event.completions)}`
              : ''}
            {' · '}
            {assigneeCountDisplay(household, event.assignedTo, actorId).label}
          </Text>
          <View style={styles.actions}>
            <Pressable style={styles.btn} disabled={busy} onPress={onToggleDone}>
              <Text style={styles.btnText}>{done ? 'Erledigt' : 'Als erledigt markieren'}</Text>
            </Pressable>
            <Pressable style={styles.ghost} disabled={busy} onPress={onEdit}>
              <Text style={styles.ghostText}>Bearbeiten</Text>
            </Pressable>
            {canDelete ? (
              <Pressable style={[styles.ghost, styles.danger]} disabled={busy} onPress={onDelete}>
                <Text style={styles.dangerText}>Löschen</Text>
              </Pressable>
            ) : null}
          </View>
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
          <Text style={styles.muted}>Beginn (YYYY-MM-DDTHH:mm)</Text>
          <TextInput
            style={styles.input}
            value={draft.startsAtLocal}
            onChangeText={(startsAtLocal) => onDraftChange({ ...draft, startsAtLocal })}
          />
          <Text style={styles.muted}>Ende optional</Text>
          <TextInput
            style={styles.input}
            value={draft.endsAtLocal}
            onChangeText={(endsAtLocal) => onDraftChange({ ...draft, endsAtLocal })}
          />
          <Text style={styles.muted}>Zuweisung (leer = Haushalt)</Text>
          {members.map((member) => (
            <View key={member.userId} style={styles.row}>
              <Text style={styles.muted}>
                {member.email ?? 'E-Mail unbekannt'}
                {member.userId === actorId ? ' · du' : ''}
              </Text>
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
            onChange={(recurrence) => onDraftChange({ ...draft, recurrence })}
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
            options={Object.entries(CALENDAR_KIND_LABELS).map(([value, label]) => ({
              value: value as CalendarEvent['kind'],
              label,
            }))}
            onChange={(kind) => onDraftChange({ ...draft, kind })}
          />
          <ChipRow
            label="Energie"
            value={draft.energyHint}
            options={Object.entries(ENERGY_HINT_LABELS).map(([value, label]) => ({
              value: value as EnergyBand,
              label,
            }))}
            onChange={(energyHint) => onDraftChange({ ...draft, energyHint })}
          />
          <View style={styles.actions}>
            <Pressable style={styles.btn} disabled={busy} onPress={onSave}>
              <Text style={styles.btnText}>{mode === 'edit' ? 'Speichern' : 'Anlegen'}</Text>
            </Pressable>
            <Pressable style={styles.ghost} disabled={busy} onPress={onClose}>
              <Text style={styles.ghostText}>Abbrechen</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}
