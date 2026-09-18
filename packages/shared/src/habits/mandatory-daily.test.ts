import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import {
  mandatoryDailyErrorMessage,
  resolveMandatoryDaily,
} from './mandatory-daily';

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
    ...overrides,
  };
}

describe('resolveMandatoryDaily', () => {
  it('clears mandatoryDaily when not requested', () => {
    expect(
      resolveMandatoryDaily(householdOf(), {
        kind: 'habit',
        recurrence: 'daily',
      }),
    ).toEqual({ ok: true, mandatoryDaily: undefined });
  });

  it('allows mandatoryDaily on pro for daily habits', () => {
    expect(
      resolveMandatoryDaily(householdOf({ plan: 'pro' }), {
        mandatoryDaily: true,
        kind: 'habit',
        recurrence: 'daily',
      }),
    ).toEqual({ ok: true, mandatoryDaily: true });
  });

  it('rejects mandatoryDaily on free plan', () => {
    expect(
      resolveMandatoryDaily(householdOf({ plan: 'free' }), {
        mandatoryDaily: true,
        kind: 'habit',
        recurrence: 'daily',
      }),
    ).toEqual({ ok: false, reason: 'pro_required' });
  });

  it('rejects mandatoryDaily without daily habit', () => {
    expect(
      resolveMandatoryDaily(householdOf({ plan: 'pro' }), {
        mandatoryDaily: true,
        kind: 'event',
        recurrence: 'daily',
      }),
    ).toEqual({ ok: false, reason: 'invalid_mandatory' });
  });
});

describe('mandatoryDailyErrorMessage', () => {
  it('maps pro_required', () => {
    expect(mandatoryDailyErrorMessage('pro_required')).toContain('Family+');
  });
});
