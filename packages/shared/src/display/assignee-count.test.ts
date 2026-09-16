import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import { assigneeCountDisplay } from './assignee-count';

function householdOf(): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    members: ['user_julian', 'user_sophie', 'user_leo'],
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
      user_leo: 'leo@home.de',
    },
  };
}

describe('assigneeCountDisplay', () => {
  it('treats empty assignees as whole household with actor included', () => {
    expect(assigneeCountDisplay(householdOf(), undefined, 'user_julian')).toEqual({
      count: 3,
      label: '3 Personen',
      actorIncluded: true,
    });
  });

  it('counts explicit assignees and marks actor when listed', () => {
    expect(assigneeCountDisplay(householdOf(), ['user_julian', 'user_sophie'], 'user_julian')).toEqual({
      count: 2,
      label: '2 Personen',
      actorIncluded: true,
    });
  });

  it('uses singular for one assignee and omits actor emphasis when absent', () => {
    expect(assigneeCountDisplay(householdOf(), ['user_sophie'], 'user_julian')).toEqual({
      count: 1,
      label: '1 Person',
      actorIncluded: false,
    });
  });
});
