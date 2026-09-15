import { isHouseholdMember, isHouseholdOwner } from '../household/access';
import type { CalendarEvent, Household, MemberCompletion } from '../types';

export type CalendarEventAccessContext = {
  actorId: string;
  household: Household;
  event: CalendarEvent;
};

export function canReadCalendarEvent(ctx: CalendarEventAccessContext): boolean {
  return (
    isHouseholdMember(ctx.actorId, ctx.household) &&
    ctx.event.householdId === ctx.household.id
  );
}

export function canCreateCalendarEvent(ctx: {
  actorId: string;
  household: Household;
}): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household);
}

export function canDeleteCalendarEvent(ctx: CalendarEventAccessContext): boolean {
  if (!canReadCalendarEvent(ctx)) {
    return false;
  }
  return isHouseholdOwner(ctx.actorId, ctx.household) || ctx.event.createdBy === ctx.actorId;
}

function completionEntryChanged(
  before: MemberCompletion | undefined,
  after: MemberCompletion | undefined,
): boolean {
  return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
}

function canUpdateCompletions(
  actorId: string,
  event: CalendarEvent,
  nextCompletions: MemberCompletion[],
): boolean {
  if (event.completionMode === 'household') {
    return true;
  }

  const prevByUser = new Map(event.completions.map((entry) => [entry.userId, entry]));
  const nextByUser = new Map(nextCompletions.map((entry) => [entry.userId, entry]));
  const userIds = new Set([...prevByUser.keys(), ...nextByUser.keys()]);

  for (const userId of userIds) {
    if (completionEntryChanged(prevByUser.get(userId), nextByUser.get(userId)) && userId !== actorId) {
      return false;
    }
  }

  return true;
}

export function canUpdateCalendarEvent(ctx: {
  actorId: string;
  household: Household;
  event: CalendarEvent;
  patch: Partial<CalendarEvent>;
}): boolean {
  if (!canReadCalendarEvent({ actorId: ctx.actorId, household: ctx.household, event: ctx.event })) {
    return false;
  }

  if (ctx.patch.householdId !== undefined && ctx.patch.householdId !== ctx.event.householdId) {
    return false;
  }
  if (ctx.patch.createdBy !== undefined && ctx.patch.createdBy !== ctx.event.createdBy) {
    return false;
  }
  if (ctx.patch.id !== undefined && ctx.patch.id !== ctx.event.id) {
    return false;
  }

  if (ctx.patch.completions !== undefined) {
    return canUpdateCompletions(ctx.actorId, ctx.event, ctx.patch.completions);
  }

  return true;
}
