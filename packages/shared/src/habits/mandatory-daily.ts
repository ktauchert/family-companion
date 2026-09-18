import type { CalendarEvent, Household, Recurrence, TodoItem } from '../types';

export type MandatoryDailyKind = CalendarEvent['kind'] | TodoItem['kind'];

export type MandatoryDailyInput = {
  mandatoryDaily?: boolean;
  kind: MandatoryDailyKind;
  recurrence: Recurrence;
};

export type ResolveMandatoryDailyResult =
  | { ok: true; mandatoryDaily: boolean | undefined }
  | { ok: false; reason: 'pro_required' | 'invalid_mandatory' };

export function resolveMandatoryDaily(
  household: Household,
  input: MandatoryDailyInput,
): ResolveMandatoryDailyResult {
  if (input.mandatoryDaily !== true) {
    return { ok: true, mandatoryDaily: undefined };
  }

  if (household.plan !== 'pro') {
    return { ok: false, reason: 'pro_required' };
  }

  if (input.kind !== 'habit' || input.recurrence !== 'daily') {
    return { ok: false, reason: 'invalid_mandatory' };
  }

  return { ok: true, mandatoryDaily: true };
}

export const MANDATORY_DAILY_LABEL = 'Pflicht-Habit (täglich)';

export function mandatoryDailyErrorMessage(
  reason: 'pro_required' | 'invalid_mandatory',
): string {
  switch (reason) {
    case 'pro_required':
      return 'Pflicht-Habits sind Teil von Family+.';
    case 'invalid_mandatory':
      return 'Pflicht-Habits brauchen Art „Habit“ und Wiederholung „Täglich“.';
  }
}
