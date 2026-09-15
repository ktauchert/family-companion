import { householdMemberLabel } from '../household/membership';
import type {
  CalendarEvent,
  CompletionMode,
  EnergyBand,
  Household,
  Recurrence,
} from '../types';

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Keine',
  daily: 'Täglich',
  weekly: 'Wöchentlich',
};

export const COMPLETION_MODE_LABELS: Record<CompletionMode, string> = {
  household: 'Haushalt',
  per_member: 'Jede Person',
};

export const CALENDAR_KIND_LABELS: Record<CalendarEvent['kind'], string> = {
  event: 'Termin',
  habit: 'Habit',
};

export const ENERGY_HINT_LABELS: Record<EnergyBand, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
};

export function calendarAssigneeLabel(household: Household, assignedTo?: string[]): string {
  if (!assignedTo || assignedTo.length === 0) {
    return 'Haushalt';
  }
  return assignedTo
    .map((userId) => householdMemberLabel(household.memberEmails?.[userId] ?? null))
    .join(', ');
}

export function formatCalendarDateTime(iso: string, locale = 'de-DE'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatCalendarEventRange(
  startsAt: string,
  endsAt?: string,
  locale = 'de-DE',
): string {
  if (!endsAt) {
    return formatCalendarDateTime(startsAt, locale);
  }
  return `${formatCalendarDateTime(startsAt, locale)} – ${formatCalendarDateTime(endsAt, locale)}`;
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function defaultStartsAtLocal(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return toDatetimeLocalValue(now.toISOString());
}

export function createCalendarEventErrorMessage(
  reason:
    | 'not_member'
    | 'title_required'
    | 'invalid_dates'
    | 'invalid_assignee'
    | 'not_allowed',
): string {
  switch (reason) {
    case 'not_member':
      return 'Du gehörst nicht zu diesem Haushalt.';
    case 'title_required':
      return 'Bitte einen Titel eingeben.';
    case 'invalid_dates':
      return 'Ende muss nach dem Beginn liegen.';
    case 'invalid_assignee':
      return 'Zuweisung muss ein Haushaltsmitglied sein.';
    case 'not_allowed':
      return 'Diese Änderung ist nicht erlaubt.';
  }
}
