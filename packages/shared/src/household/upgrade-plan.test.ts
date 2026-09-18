import { describe, expect, it } from 'vitest';
import type { Household } from '../types';
import { startHousehold } from './membership';
import { upgradeHouseholdPlanMessage, upgradeHouseholdToPro } from './upgrade-plan';

function householdOf(overrides: Partial<Household> = {}): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    ...overrides,
  };
}

describe('upgradeHouseholdToPro', () => {
  it('lets the owner upgrade a free household to pro', () => {
    const household = householdOf();
    const result = upgradeHouseholdToPro(household, { actorId: 'user_julian' });
    expect(result).toEqual({
      ok: true,
      household: { ...household, plan: 'pro' },
    });
  });

  it('rejects upgrade from a non-owner', () => {
    const household = householdOf({ members: ['user_julian', 'user_sophie'] });
    const result = upgradeHouseholdToPro(household, { actorId: 'user_sophie' });
    expect(result).toEqual({ ok: false, reason: 'not_owner' });
  });

  it('rejects upgrade when the household is already pro', () => {
    const household = householdOf({ plan: 'pro' });
    const result = upgradeHouseholdToPro(household, { actorId: 'user_julian' });
    expect(result).toEqual({ ok: false, reason: 'already_pro' });
  });
});

describe('upgradeHouseholdPlanMessage', () => {
  it('maps known reasons to user-facing copy', () => {
    expect(upgradeHouseholdPlanMessage('not_owner')).toBe(
      'Nur der Inhaber kann Family+ aktivieren.',
    );
    expect(upgradeHouseholdPlanMessage('already_pro')).toBe('Family+ ist schon aktiv.');
  });
});
