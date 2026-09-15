import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import { itemOpenClosedLabel, perMemberCompletionLabel } from './status';

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

describe('status labels', () => {
  it('formats open and closed', () => {
    expect(itemOpenClosedLabel(false)).toBe('Offen');
    expect(itemOpenClosedLabel(true)).toBe('Erledigt');
  });

  it('summarizes per-member completion', () => {
    expect(
      perMemberCompletionLabel(householdOf(), [
        { userId: 'user_julian', done: true, doneAt: '2026-09-15T08:00:00.000Z' },
        { userId: 'user_sophie', done: false },
      ]),
    ).toBe('1/2 erledigt (julian@home.de)');
  });
});
