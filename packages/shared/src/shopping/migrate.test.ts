import { describe, expect, it } from 'vitest';
import type { ShoppingCategory } from '../types';
import {
  DEFAULT_SHOPPING_LIST_SPECS,
  defaultShoppingListId,
  defaultShoppingListsForHousehold,
  isShoppingListInHousehold,
  missingDefaultShoppingLists,
  parseDefaultShoppingListCategory,
} from './defaults';
import { normalizeShoppingItem, shoppingItemNeedsListMigration } from './migrate';

describe('defaultShoppingListsForHousehold', () => {
  it('seeds one list per legacy category with stable ids', () => {
    const lists = defaultShoppingListsForHousehold({
      householdId: 'hh_1',
      createdBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    });

    expect(lists).toHaveLength(DEFAULT_SHOPPING_LIST_SPECS.length);
    expect(lists[0]).toEqual({
      id: 'hh_1_supermarket',
      householdId: 'hh_1',
      name: 'Supermarkt',
      sortOrder: 0,
      createdBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    });
  });
});

describe('missingDefaultShoppingLists', () => {
  it('returns only lists that are not present yet', () => {
    const missing = missingDefaultShoppingLists(
      [
        {
          id: 'hh_1_supermarket',
          householdId: 'hh_1',
          name: 'Supermarkt',
          sortOrder: 0,
          createdBy: 'user_julian',
          createdAt: '2026-09-15T08:00:00.000Z',
        },
      ],
      {
        householdId: 'hh_1',
        createdBy: 'user_julian',
        createdAt: '2026-09-15T08:00:00.000Z',
      },
    );

    expect(missing.map((list) => list.id)).toEqual([
      'hh_1_drugstore',
      'hh_1_pharmacy',
      'hh_1_clothing',
      'hh_1_other',
    ]);
  });
});

describe('parseDefaultShoppingListCategory', () => {
  it('extracts legacy category from default list ids', () => {
    expect(parseDefaultShoppingListCategory('hh_1_supermarket', 'hh_1')).toBe('supermarket');
    expect(parseDefaultShoppingListCategory('custom_list', 'hh_1')).toBeUndefined();
  });
});

describe('isShoppingListInHousehold', () => {
  it('rejects foreign household lists', () => {
    expect(
      isShoppingListInHousehold('hh_1_supermarket', 'hh_1', [
        {
          id: 'hh_1_supermarket',
          householdId: 'hh_1',
          name: 'Supermarkt',
          sortOrder: 0,
          createdBy: 'user_julian',
          createdAt: '2026-09-15T08:00:00.000Z',
        },
      ]),
    ).toBe(true);
    expect(
      isShoppingListInHousehold('hh_2_supermarket', 'hh_1', [
        {
          id: 'hh_2_supermarket',
          householdId: 'hh_2',
          name: 'Supermarkt',
          sortOrder: 0,
          createdBy: 'user_julian',
          createdAt: '2026-09-15T08:00:00.000Z',
        },
      ]),
    ).toBe(false);
  });
});

describe('normalizeShoppingItem', () => {
  it('maps legacy category to default listId', () => {
    expect(
      normalizeShoppingItem({
        id: 'shop_1',
        householdId: 'hh_1',
        name: 'Milch',
        category: 'supermarket' as ShoppingCategory,
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:00:00.000Z',
      }),
    ).toEqual({
      id: 'shop_1',
      householdId: 'hh_1',
      name: 'Milch',
      listId: defaultShoppingListId('hh_1', 'supermarket'),
      checked: false,
      addedBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    });
  });

  it('keeps listId when already migrated', () => {
    const item = {
      id: 'shop_1',
      householdId: 'hh_1',
      name: 'Milch',
      listId: 'list_custom',
      checked: false,
      addedBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    };
    expect(normalizeShoppingItem(item)).toEqual(item);
  });

  it('flags legacy rows for migration', () => {
    expect(
      shoppingItemNeedsListMigration({
        id: 'shop_1',
        householdId: 'hh_1',
        name: 'Milch',
        category: 'supermarket',
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:00:00.000Z',
      }),
    ).toBe(true);
  });
});
