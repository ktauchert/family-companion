import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household } from '../types';
import {
  initialCompletionsForMode,
  isCalendarEventDone,
  isCalendarEventDoneForUser,
  prepareToggleCalendarEventCompletion,
} from './completion';

function householdOf(): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    members: ['user_julian', 'user_sophie'],
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    },
  };
}

function eventOf(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt_1',
    householdId: 'hh_1',
    createdBy: 'user_sophie',
    title: 'Fitness',
    startsAt: '2026-09-20T18:00:00.000Z',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    completions: [],
    ...overrides,
  };
}

describe('initialCompletionsForMode', () => {
  it('returns empty completions for household mode', () => {
    expect(initialCompletionsForMode(householdOf(), 'household')).toEqual([]);
  });

  it('seeds per_member completions for each household member', () => {
    expect(initialCompletionsForMode(householdOf(), 'per_member')).toEqual([
      { userId: 'user_julian', done: false },
      { userId: 'user_sophie', done: false },
    ]);
  });
});

describe('prepareToggleCalendarEventCompletion', () => {
  const household = householdOf();

  it('marks household events done for everyone', () => {
    const result = prepareToggleCalendarEventCompletion({
      actorId: 'user_sophie',
      household,
      event: eventOf({ completionMode: 'household' }),
      done: true,
      doneAt: '2026-09-20T19:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      event: eventOf({
        completionMode: 'household',
        completions: [{ userId: 'user_sophie', done: true, doneAt: '2026-09-20T19:00:00.000Z' }],
      }),
    });
    expect(isCalendarEventDone((result as { ok: true; event: CalendarEvent }).event)).toBe(true);
  });

  it('toggles only the actor entry in per_member mode', () => {
    const result = prepareToggleCalendarEventCompletion({
      actorId: 'user_sophie',
      household,
      event: eventOf({
        completionMode: 'per_member',
        completions: [
          { userId: 'user_julian', done: false },
          { userId: 'user_sophie', done: false },
        ],
      }),
      done: true,
      doneAt: '2026-09-20T19:00:00.000Z',
    });

    expect(result).toMatchObject({
      ok: true,
      event: {
        completions: [
          { userId: 'user_julian', done: false },
          { userId: 'user_sophie', done: true, doneAt: '2026-09-20T19:00:00.000Z' },
        ],
      },
    });
    expect(isCalendarEventDoneForUser((result as { ok: true; event: CalendarEvent }).event, 'user_sophie')).toBe(
      true,
    );
    expect(isCalendarEventDone((result as { ok: true; event: CalendarEvent }).event)).toBe(false);
  });
});
