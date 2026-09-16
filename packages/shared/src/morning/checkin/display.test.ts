import { describe, expect, it } from 'vitest';
import { startHousehold } from '../../household/membership';
import type { Household, MorningCheckIn } from '../../types';
import { formatMorningCheckInChip } from './display';

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

describe('formatMorningCheckInChip', () => {
  it('formats household check-ins with mood and energy values', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'ci_s', householdId: 'hh_1', userId: 'user_sophie', date: '2026-09-15', mood: 3, energy: 4 },
      { id: 'ci_j', householdId: 'hh_1', userId: 'user_julian', date: '2026-09-15', mood: 3, energy: 3 },
    ];

    expect(formatMorningCheckInChip(checkIns, householdOf())).toBe(
      'Check-in · julian@home.de 3/3 · sophie@home.de 3/4',
    );
  });

  it('returns empty string without check-ins', () => {
    expect(formatMorningCheckInChip([], householdOf())).toBe('');
  });
});
