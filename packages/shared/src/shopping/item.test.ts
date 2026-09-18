import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household, ShoppingList } from '../types';
import { defaultShoppingListId } from './defaults';
import {
  isShoppingItemOpen,
  normalizeShoppingItemChecked,
  prepareCreateShoppingItem,
  prepareToggleShoppingItemChecked,
} from './item';

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

function listsOf(): ShoppingList[] {
  return [
    {
      id: defaultShoppingListId('hh_1', 'supermarket'),
      householdId: 'hh_1',
      name: 'Supermarkt',
      sortOrder: 0,
      createdBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    },
  ];
}

describe('prepareCreateShoppingItem', () => {
  it('creates an item with listId', () => {
    const result = prepareCreateShoppingItem({
      actorId: 'user_sophie',
      household: householdOf(),
      itemId: 'shop_new',
      name: ' Milch ',
      listId: defaultShoppingListId('hh_1', 'supermarket'),
      lists: listsOf(),
      createdAt: '2026-09-20T10:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      item: {
        id: 'shop_new',
        householdId: 'hh_1',
        name: 'Milch',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: false,
        addedBy: 'user_sophie',
        createdAt: '2026-09-20T10:00:00.000Z',
      },
    });
  });

  it('rejects invalid list ids', () => {
    expect(
      prepareCreateShoppingItem({
        actorId: 'user_sophie',
        household: householdOf(),
        itemId: 'shop_new',
        name: 'Milch',
        listId: 'foreign_list',
        lists: listsOf(),
        createdAt: '2026-09-20T10:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'invalid_list' });
  });
});

describe('prepareToggleShoppingItemChecked', () => {
  it('sets checkedAt when checking off', () => {
    const household = householdOf();
    const item = {
      id: 'shop_1',
      householdId: 'hh_1',
      name: 'Milch',
      listId: defaultShoppingListId('hh_1', 'supermarket'),
      checked: false,
      addedBy: 'user_sophie',
      createdAt: '2026-09-20T10:00:00.000Z',
    };

    const result = prepareToggleShoppingItemChecked({
      actorId: 'user_julian',
      household,
      item,
      lists: listsOf(),
      checked: true,
      checkedAt: '2026-09-20T11:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      item: { ...item, checked: true, checkedAt: '2026-09-20T11:00:00.000Z' },
    });
  });
});

describe('isShoppingItemOpen', () => {
  it('treats only strict true as checked off', () => {
    expect(isShoppingItemOpen({ checked: false })).toBe(true);
    expect(isShoppingItemOpen({ checked: true })).toBe(false);
    expect(isShoppingItemOpen({ checked: 'true' as unknown as boolean })).toBe(true);
  });

  it('normalizes legacy checked values from firestore reads', () => {
    expect(normalizeShoppingItemChecked(true)).toBe(true);
    expect(normalizeShoppingItemChecked(false)).toBe(false);
    expect(normalizeShoppingItemChecked('true')).toBe(false);
  });
});
