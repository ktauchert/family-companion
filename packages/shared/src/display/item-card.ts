import {
  CALENDAR_KIND_LABELS,
  COMPLETION_MODE_LABELS,
  RECURRENCE_LABELS,
  formatCalendarEventRange,
} from '../calendar/display';
import { TODO_KIND_LABELS, formatDueDate } from '../todos/display';
import type { CalendarEvent, Household, TodoItem } from '../types';
import { assigneeCountDisplay } from './assignee-count';

export type ItemCardPillShape = 'pill' | 'soft' | 'tag';

export type ItemCardPill = {
  key: string;
  label: string;
  shape: ItemCardPillShape;
  emphasis?: boolean;
};

type ItemCardPillOptions = {
  household: Household;
  actorId: string;
};

function assigneePill(household: Household, assignedTo: string[] | undefined, actorId: string): ItemCardPill {
  const assignee = assigneeCountDisplay(household, assignedTo, actorId);
  return {
    key: 'assignee',
    label: assignee.label,
    shape: 'pill',
    emphasis: assignee.actorIncluded,
  };
}

function recurrencePill(recurrence: CalendarEvent['recurrence']): ItemCardPill | null {
  if (recurrence === 'none') {
    return null;
  }
  return {
    key: 'recurrence',
    label: RECURRENCE_LABELS[recurrence],
    shape: 'soft',
  };
}

function completionModePill(mode: CalendarEvent['completionMode']): ItemCardPill | null {
  if (mode === 'household') {
    return null;
  }
  return {
    key: 'completionMode',
    label: COMPLETION_MODE_LABELS[mode],
    shape: 'soft',
  };
}

export function eventCardPills(event: CalendarEvent, options: ItemCardPillOptions): ItemCardPill[] {
  const pills: ItemCardPill[] = [
    {
      key: 'time',
      label: formatCalendarEventRange(event.startsAt, event.endsAt),
      shape: 'soft',
    },
    {
      key: 'kind',
      label: CALENDAR_KIND_LABELS[event.kind],
      shape: event.kind === 'habit' ? 'tag' : 'pill',
    },
  ];

  const recurrence = recurrencePill(event.recurrence);
  if (recurrence) {
    pills.push(recurrence);
  }

  const completionMode = completionModePill(event.completionMode);
  if (completionMode) {
    pills.push(completionMode);
  }

  pills.push(assigneePill(options.household, event.assignedTo, options.actorId));
  return pills;
}

export function todoCardPills(todo: TodoItem, options: ItemCardPillOptions): ItemCardPill[] {
  const pills: ItemCardPill[] = [];

  if (todo.dueDate) {
    pills.push({
      key: 'due',
      label: `Fällig ${formatDueDate(todo.dueDate)}`,
      shape: 'soft',
    });
  }

  pills.push({
    key: 'kind',
    label: TODO_KIND_LABELS[todo.kind],
    shape: todo.kind === 'habit' ? 'tag' : 'soft',
  });

  const recurrence = recurrencePill(todo.recurrence);
  if (recurrence) {
    pills.push(recurrence);
  }

  const completionMode = completionModePill(todo.completionMode);
  if (completionMode) {
    pills.push(completionMode);
  }

  pills.push(assigneePill(options.household, todo.assignedTo, options.actorId));
  return pills;
}
