import { isHouseholdMember } from '../household/access';
import { resolveMandatoryDaily } from '../habits/mandatory-daily';
import type { CalendarEvent, CompletionMode, EnergyBand, Household, Recurrence } from '../types';
import { initialCompletionsForMode } from './completion';
import { canUpdateCalendarEvent } from './permissions';

export type CreateCalendarEventInput = {
  actorId: string;
  household: Household;
  eventId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  assignedTo?: string[];
  completionMode?: CompletionMode;
  recurrence?: Recurrence;
  kind?: CalendarEvent['kind'];
  mandatoryDaily?: boolean;
  energyHint?: EnergyBand;
};

export type CreateCalendarEventResult =
  | { ok: true; event: CalendarEvent }
  | {
      ok: false;
      reason:
        | 'not_member'
        | 'title_required'
        | 'invalid_dates'
        | 'invalid_assignee'
        | 'pro_required'
        | 'invalid_mandatory';
    };

export type UpdateCalendarEventResult =
  | { ok: true; event: CalendarEvent }
  | {
      ok: false;
      reason:
        | 'not_allowed'
        | 'title_required'
        | 'invalid_dates'
        | 'invalid_assignee'
        | 'pro_required'
        | 'invalid_mandatory';
    };

export function prepareCreateCalendarEvent(
  input: CreateCalendarEventInput,
): CreateCalendarEventResult {
  if (!isHouseholdMember(input.actorId, input.household)) {
    return { ok: false, reason: 'not_member' };
  }

  const title = input.title.trim();
  if (title.length === 0) {
    return { ok: false, reason: 'title_required' };
  }

  if (input.endsAt !== undefined && input.endsAt < input.startsAt) {
    return { ok: false, reason: 'invalid_dates' };
  }

  if (input.assignedTo) {
    for (const userId of input.assignedTo) {
      if (!input.household.members.includes(userId)) {
        return { ok: false, reason: 'invalid_assignee' };
      }
    }
  }

  const completionMode = input.completionMode ?? 'household';
  const kind = input.kind ?? 'event';
  const recurrence = input.recurrence ?? 'none';

  const mandatory = resolveMandatoryDaily(input.household, {
    mandatoryDaily: input.mandatoryDaily,
    kind,
    recurrence,
  });
  if (!mandatory.ok) {
    return { ok: false, reason: mandatory.reason };
  }

  const event: CalendarEvent = {
    id: input.eventId,
    householdId: input.household.id,
    title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    assignedTo: input.assignedTo,
    completionMode,
    recurrence,
    kind,
    mandatoryDaily: mandatory.mandatoryDaily,
    energyHint: input.energyHint,
    completions: initialCompletionsForMode(input.household, completionMode),
    createdBy: input.actorId,
  };

  return { ok: true, event };
}

export function prepareUpdateCalendarEvent(
  input: {
    actorId: string;
    household: Household;
    event: CalendarEvent;
    patch: Partial<CalendarEvent>;
  },
): UpdateCalendarEventResult {
  if (!canUpdateCalendarEvent(input)) {
    return { ok: false, reason: 'not_allowed' };
  }

  const next: CalendarEvent = { ...input.event, ...input.patch };

  if (
    input.patch.completionMode !== undefined &&
    input.patch.completionMode !== input.event.completionMode
  ) {
    next.completions = initialCompletionsForMode(input.household, next.completionMode);
  }

  const title = next.title.trim();
  if (title.length === 0) {
    return { ok: false, reason: 'title_required' };
  }

  if (next.endsAt !== undefined && next.endsAt < next.startsAt) {
    return { ok: false, reason: 'invalid_dates' };
  }

  if (next.assignedTo) {
    for (const userId of next.assignedTo) {
      if (!input.household.members.includes(userId)) {
        return { ok: false, reason: 'invalid_assignee' };
      }
    }
  }

  const mandatory = resolveMandatoryDaily(input.household, {
    mandatoryDaily: next.mandatoryDaily,
    kind: next.kind,
    recurrence: next.recurrence,
  });
  if (!mandatory.ok) {
    return { ok: false, reason: mandatory.reason };
  }
  next.mandatoryDaily = mandatory.mandatoryDaily;

  return { ok: true, event: { ...next, title } };
}
