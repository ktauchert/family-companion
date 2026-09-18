import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household } from '../types';
import { evaluateKaizenNudge, isKaizenEvening, KAIZEN_EVENING_HOUR } from './nudge';

function householdOf(overrides: Partial<Household> = {}): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    members: ['user_julian'],
    memberEmails: { user_julian: 'julian@home.de' },
    plan: 'pro',
    ...overrides,
  };
}

describe('isKaizenEvening', () => {
  it(`is true from ${KAIZEN_EVENING_HOUR}:00 local`, () => {
    expect(isKaizenEvening(new Date('2026-09-18T17:59:00'))).toBe(false);
    expect(isKaizenEvening(new Date('2026-09-18T18:00:00'))).toBe(true);
  });
});

describe('evaluateKaizenNudge', () => {
  const openEvent: CalendarEvent = {
    id: 'evt_1',
    householdId: 'hh_1',
    createdBy: 'user_julian',
    title: 'Fitness',
    startsAt: '2026-09-18T07:00:00.000Z',
    completionMode: 'per_member',
    recurrence: 'daily',
    kind: 'habit',
    mandatoryDaily: true,
    completions: [{ userId: 'user_julian', done: false }],
  };

  it('returns a nudge in the evening for open mandatory habits', () => {
    const result = evaluateKaizenNudge({
      household: householdOf(),
      actorId: 'user_julian',
      date: '2026-09-18',
      now: new Date('2026-09-18T19:00:00'),
      events: [openEvent],
      todos: [],
      kaizenNudgesEnabled: true,
    });

    expect(result).toEqual({
      habitTitle: 'Fitness',
      habitId: 'evt_1',
      targetKind: 'event',
      quote: expect.any(String),
    });
  });

  it('returns null before evening', () => {
    expect(
      evaluateKaizenNudge({
        household: householdOf(),
        actorId: 'user_julian',
        date: '2026-09-18',
        now: new Date('2026-09-18T10:00:00'),
        events: [openEvent],
        todos: [],
        kaizenNudgesEnabled: true,
      }),
    ).toBeNull();
  });

  it('returns null when nudges are disabled', () => {
    expect(
      evaluateKaizenNudge({
        household: householdOf(),
        actorId: 'user_julian',
        date: '2026-09-18',
        now: new Date('2026-09-18T19:00:00'),
        events: [openEvent],
        todos: [],
        kaizenNudgesEnabled: false,
      }),
    ).toBeNull();
  });
});
