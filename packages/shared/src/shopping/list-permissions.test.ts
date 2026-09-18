import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import {
  canCreateShoppingList,
  canDeleteShoppingList,
  canReadShoppingList,
  canUpdateShoppingList,
} from './list-permissions';

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

const list = {
  id: 'list_dm',
  householdId: 'hh_1',
  name: 'DM',
  sortOrder: 5,
  createdBy: 'user_sophie',
  createdAt: '2026-09-15T08:00:00.000Z',
};

describe('shopping list permissions', () => {
  const household = householdOf();

  it('allows members to read and update lists', () => {
    expect(canCreateShoppingList({ actorId: 'user_sophie', household })).toBe(true);
    expect(canReadShoppingList({ actorId: 'user_sophie', household, list })).toBe(true);
    expect(canUpdateShoppingList({ actorId: 'user_sophie', household, list })).toBe(true);
  });

  it('allows only the owner to delete lists', () => {
    expect(canDeleteShoppingList({ actorId: 'user_julian', household, list })).toBe(true);
    expect(canDeleteShoppingList({ actorId: 'user_sophie', household, list })).toBe(false);
  });

  it('denies foreign households', () => {
    expect(
      canReadShoppingList({
        actorId: 'user_julian',
        household,
        list: { ...list, householdId: 'hh_2' },
      }),
    ).toBe(false);
  });
});
