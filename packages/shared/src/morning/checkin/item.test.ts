import { describe, expect, it } from 'vitest';
import { startHousehold } from '../../household/membership';
import type { Household } from '../../types';
import { prepareCreateMorningCheckIn } from './item';

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
    memberEmails: {},
  };
}

describe('prepareCreateMorningCheckIn', () => {
  it('creates a check-in for the actor', () => {
    const result = prepareCreateMorningCheckIn({
      actorId: 'user_sophie',
      household: householdOf(),
      checkInId: 'ci_new',
      mood: 3,
      energy: 4,
      date: '2026-09-15',
      existingForUserOnDate: null,
    });

    expect(result).toEqual({
      ok: true,
      checkIn: {
        id: 'ci_new',
        householdId: 'hh_1',
        userId: 'user_sophie',
        date: '2026-09-15',
        mood: 3,
        energy: 4,
      },
    });
  });

  it('rejects a second check-in on the same day', () => {
    expect(
      prepareCreateMorningCheckIn({
        actorId: 'user_sophie',
        household: householdOf(),
        checkInId: 'ci_new',
        mood: 3,
        energy: 4,
        date: '2026-09-15',
        existingForUserOnDate: {
          id: 'ci_old',
          householdId: 'hh_1',
          userId: 'user_sophie',
          date: '2026-09-15',
          mood: 2,
          energy: 2,
        },
      }),
    ).toEqual({ ok: false, reason: 'already_exists' });
  });
});
