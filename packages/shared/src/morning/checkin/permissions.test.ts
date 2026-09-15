import { describe, expect, it } from 'vitest';
import { startHousehold } from '../../household/membership';
import type { Household, MorningCheckIn } from '../../types';
import {
  canCreateMorningCheckIn,
  canDeleteMorningCheckIn,
  canReadMorningCheckIn,
  canUpdateMorningCheckIn,
} from './permissions';

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

function checkInOf(overrides: Partial<MorningCheckIn> = {}): MorningCheckIn {
  return {
    id: 'ci_1',
    householdId: 'hh_1',
    userId: 'user_sophie',
    date: '2026-09-15',
    mood: 3,
    energy: 4,
    ...overrides,
  };
}

describe('morning check-in permissions', () => {
  const household = householdOf();

  it('allows members to read household check-ins', () => {
    expect(
      canReadMorningCheckIn({
        actorId: 'user_julian',
        household,
        checkIn: checkInOf(),
      }),
    ).toBe(true);
  });

  it('denies non-members', () => {
    expect(
      canReadMorningCheckIn({
        actorId: 'user_stranger',
        household,
        checkIn: checkInOf(),
      }),
    ).toBe(false);
  });

  it('allows self create only', () => {
    expect(canCreateMorningCheckIn({ actorId: 'user_sophie', household, userId: 'user_sophie' })).toBe(
      true,
    );
    expect(canCreateMorningCheckIn({ actorId: 'user_julian', household, userId: 'user_sophie' })).toBe(
      false,
    );
  });

  it('allows update on the same calendar day only', () => {
    expect(
      canUpdateMorningCheckIn({
        actorId: 'user_sophie',
        household,
        checkIn: checkInOf({ date: '2026-09-15' }),
        today: '2026-09-15',
      }),
    ).toBe(true);
    expect(
      canUpdateMorningCheckIn({
        actorId: 'user_sophie',
        household,
        checkIn: checkInOf({ date: '2026-09-14' }),
        today: '2026-09-15',
      }),
    ).toBe(false);
  });

  it('denies delete always', () => {
    expect(canDeleteMorningCheckIn()).toBe(false);
  });
});
