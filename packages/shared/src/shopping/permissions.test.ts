import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household, ShoppingItem } from '../types';
import {
  canCreateShoppingItem,
  canDeleteShoppingItem,
  canReadShoppingItem,
  canUpdateShoppingItem,
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
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    },
  };
}

function itemOf(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 'shop_1',
    householdId: 'hh_1',
    name: 'Milch',
    category: 'supermarket',
    checked: false,
    addedBy: 'user_sophie',
    createdAt: '2026-09-20T10:00:00.000Z',
    ...overrides,
  };
}

describe('canDeleteShoppingItem', () => {
  const household = householdOf();

  it('lets the owner delete any item', () => {
    expect(
      canDeleteShoppingItem({
        actorId: 'user_julian',
        household,
        item: itemOf({ addedBy: 'user_sophie' }),
      }),
    ).toBe(true);
  });

  it('denies deleting a foreign item as member', () => {
    expect(
      canDeleteShoppingItem({
        actorId: 'user_sophie',
        household,
        item: itemOf({ addedBy: 'user_julian' }),
      }),
    ).toBe(false);
  });
});

describe('canUpdateShoppingItem', () => {
  const household = householdOf();

  it('denies changing addedBy', () => {
    expect(
      canUpdateShoppingItem({
        actorId: 'user_sophie',
        household,
        item: itemOf(),
        patch: { addedBy: 'user_julian' },
      }),
    ).toBe(false);
  });

  it('allows checking off an item', () => {
    expect(
      canUpdateShoppingItem({
        actorId: 'user_julian',
        household,
        item: itemOf(),
        patch: { checked: true, checkedAt: '2026-09-20T11:00:00.000Z' },
      }),
    ).toBe(true);
  });
});

describe('canReadShoppingItem / canCreateShoppingItem', () => {
  const household = householdOf();

  it('allows household members', () => {
    expect(canCreateShoppingItem({ actorId: 'user_sophie', household })).toBe(true);
    expect(
      canReadShoppingItem({ actorId: 'user_sophie', household, item: itemOf() }),
    ).toBe(true);
  });

  it('denies non-members', () => {
    expect(canCreateShoppingItem({ actorId: 'user_stranger', household })).toBe(false);
  });
});
