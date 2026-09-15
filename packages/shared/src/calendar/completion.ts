import type { CalendarEvent, Household } from '../types';
import { canUpdateCalendarEvent } from './permissions';

export function isCalendarEventDone(event: CalendarEvent): boolean {
  if (event.completionMode === 'household') {
    return event.completions.some((entry) => entry.done);
  }
  return event.completions.length > 0 && event.completions.every((entry) => entry.done);
}

export function isCalendarEventDoneForUser(event: CalendarEvent, userId: string): boolean {
  if (event.completionMode === 'household') {
    return isCalendarEventDone(event);
  }
  return event.completions.find((entry) => entry.userId === userId)?.done ?? false;
}

export function initialCompletionsForMode(
  household: Household,
  completionMode: CalendarEvent['completionMode'],
): CalendarEvent['completions'] {
  if (completionMode === 'per_member') {
    return household.members.map((userId) => ({ userId, done: false }));
  }
  return [];
}

export type ToggleCalendarCompletionResult =
  | { ok: true; event: CalendarEvent }
  | { ok: false; reason: 'not_allowed' };

export function prepareToggleCalendarEventCompletion(input: {
  actorId: string;
  household: Household;
  event: CalendarEvent;
  done: boolean;
  doneAt: string;
}): ToggleCalendarCompletionResult {
  let nextCompletions: CalendarEvent['completions'];

  if (input.event.completionMode === 'household') {
    nextCompletions = input.done
      ? [{ userId: input.actorId, done: true, doneAt: input.doneAt }]
      : [];
  } else {
    const byUser = new Map(input.event.completions.map((entry) => [entry.userId, entry]));
    for (const userId of input.household.members) {
      if (!byUser.has(userId)) {
        byUser.set(userId, { userId, done: false });
      }
    }
    const actorEntry = byUser.get(input.actorId);
    if (!actorEntry) {
      return { ok: false, reason: 'not_allowed' };
    }
    byUser.set(input.actorId, {
      ...actorEntry,
      done: input.done,
      doneAt: input.done ? input.doneAt : undefined,
    });
    nextCompletions = input.household.members.map((userId) => byUser.get(userId)!);
  }

  const patch = { completions: nextCompletions };
  if (
    !canUpdateCalendarEvent({
      actorId: input.actorId,
      household: input.household,
      event: input.event,
      patch,
    })
  ) {
    return { ok: false, reason: 'not_allowed' };
  }

  return { ok: true, event: { ...input.event, ...patch } };
}
