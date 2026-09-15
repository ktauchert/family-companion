import { householdMemberLabel } from '../household/membership';
import type { Household, TodoItem } from '../types';
import {
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
} from '../calendar/display';

export { COMPLETION_MODE_LABELS, ENERGY_HINT_LABELS, RECURRENCE_LABELS };

export const TODO_KIND_LABELS: Record<TodoItem['kind'], string> = {
  task: 'Aufgabe',
  habit: 'Habit',
};

export function todoAssigneeLabel(household: Household, assignedTo?: string[]): string {
  if (!assignedTo || assignedTo.length === 0) {
    return 'Haushalt';
  }
  return assignedTo
    .map((userId) => householdMemberLabel(household.memberEmails?.[userId] ?? null))
    .join(', ');
}

export function formatDueDate(dueDate: string, locale = 'de-DE'): string {
  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }
  return date.toLocaleDateString(locale, { dateStyle: 'medium' });
}
