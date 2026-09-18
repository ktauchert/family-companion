import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household, ShoppingItem, ShoppingList } from '../types';
import {
  nextShoppingListSortOrder,
  prepareCreateShoppingList,
  prepareDeleteShoppingList,
  prepareDeleteShoppingListPlan,
  prepareRelocateShoppingItems,
  prepareUpdateShoppingList,
  shoppingListDeleteTargets,
} from './list';

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

function listOf(overrides: Partial<ShoppingList> = {}): ShoppingList {
  return {
    id: 'list_dm',
    householdId: 'hh_1',
    name: 'DM',
    sortOrder: 5,
    createdBy: 'user_sophie',
    createdAt: '2026-09-15T08:00:00.000Z',
    ...overrides,
  };
}

describe('prepareCreateShoppingList', () => {
  it('creates a custom list for any member', () => {
    const result = prepareCreateShoppingList({
      actorId: 'user_sophie',
      household: householdOf(),
      listId: 'list_dm',
      name: ' DM ',
      sortOrder: 5,
      createdAt: '2026-09-15T08:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      list: {
        id: 'list_dm',
        householdId: 'hh_1',
        name: 'DM',
        sortOrder: 5,
        createdBy: 'user_sophie',
        createdAt: '2026-09-15T08:00:00.000Z',
      },
    });
  });

  it('rejects empty names', () => {
    expect(
      prepareCreateShoppingList({
        actorId: 'user_sophie',
        household: householdOf(),
        listId: 'list_dm',
        name: '   ',
        sortOrder: 0,
        createdAt: '2026-09-15T08:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'name_required' });
  });
});

describe('prepareUpdateShoppingList', () => {
  it('allows members to rename lists', () => {
    const result = prepareUpdateShoppingList({
      actorId: 'user_sophie',
      household: householdOf(),
      list: listOf(),
      patch: { name: 'Handwerk' },
    });

    expect(result).toEqual({
      ok: true,
      list: listOf({ name: 'Handwerk' }),
    });
  });
});

describe('prepareDeleteShoppingList', () => {
  it('allows owner to delete empty lists', () => {
    expect(
      prepareDeleteShoppingList({
        actorId: 'user_julian',
        household: householdOf(),
        list: listOf(),
        itemCount: 0,
      }),
    ).toEqual({ ok: true });
  });

  it('denies members without owner role', () => {
    expect(
      prepareDeleteShoppingList({
        actorId: 'user_sophie',
        household: householdOf(),
        list: listOf(),
        itemCount: 0,
      }),
    ).toEqual({ ok: false, reason: 'not_allowed' });
  });

  it('blocks delete while items remain', () => {
    expect(
      prepareDeleteShoppingList({
        actorId: 'user_julian',
        household: householdOf(),
        list: listOf(),
        itemCount: 2,
      }),
    ).toEqual({ ok: false, reason: 'list_has_items' });
  });
});

function itemOf(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 'shop_1',
    householdId: 'hh_1',
    name: 'Milch',
    listId: 'list_dm',
    checked: false,
    addedBy: 'user_sophie',
    createdAt: '2026-09-15T08:00:00.000Z',
    ...overrides,
  };
}

describe('nextShoppingListSortOrder', () => {
  it('starts at zero for an empty household', () => {
    expect(nextShoppingListSortOrder([])).toBe(0);
  });

  it('places custom lists after existing sort orders', () => {
    expect(
      nextShoppingListSortOrder([
        listOf({ sortOrder: 0 }),
        listOf({ id: 'list_hw', name: 'Handwerk', sortOrder: 4 }),
      ]),
    ).toBe(5);
  });
});

describe('shoppingListDeleteTargets', () => {
  it('excludes the list being deleted', () => {
    const lists = [listOf(), listOf({ id: 'list_hw', name: 'Handwerk', sortOrder: 6 })];
    expect(shoppingListDeleteTargets('list_dm', lists).map((list) => list.id)).toEqual(['list_hw']);
  });
});

describe('prepareRelocateShoppingItems', () => {
  it('moves all items from one list to another', () => {
    const result = prepareRelocateShoppingItems({
      actorId: 'user_julian',
      household: householdOf(),
      items: [itemOf(), itemOf({ id: 'shop_2', name: 'Brot' })],
      fromListId: 'list_dm',
      toListId: 'list_hw',
      lists: [listOf(), listOf({ id: 'list_hw', name: 'Handwerk', sortOrder: 6 })],
    });

    expect(result).toEqual({
      ok: true,
      items: [
        itemOf({ listId: 'list_hw' }),
        itemOf({ id: 'shop_2', name: 'Brot', listId: 'list_hw' }),
      ],
    });
  });

  it('rejects invalid move targets', () => {
    expect(
      prepareRelocateShoppingItems({
        actorId: 'user_julian',
        household: householdOf(),
        items: [itemOf()],
        fromListId: 'list_dm',
        toListId: 'list_missing',
        lists: [listOf()],
      }),
    ).toEqual({ ok: false, reason: 'invalid_move_target' });
  });
});

describe('prepareDeleteShoppingListPlan', () => {
  const lists = [listOf(), listOf({ id: 'list_hw', name: 'Handwerk', sortOrder: 6 })];

  it('deletes empty lists without relocation', () => {
    expect(
      prepareDeleteShoppingListPlan({
        actorId: 'user_julian',
        household: householdOf(),
        list: listOf(),
        lists,
        items: [],
      }),
    ).toEqual({ ok: true, kind: 'delete_only' });
  });

  it('requires a move target when items remain', () => {
    expect(
      prepareDeleteShoppingListPlan({
        actorId: 'user_julian',
        household: householdOf(),
        list: listOf(),
        lists,
        items: [itemOf()],
      }),
    ).toEqual({ ok: false, reason: 'list_has_items' });
  });

  it('relocates items before delete when a target is chosen', () => {
    const result = prepareDeleteShoppingListPlan({
      actorId: 'user_julian',
      household: householdOf(),
      list: listOf(),
      lists,
      items: [itemOf()],
      moveToListId: 'list_hw',
    });

    expect(result).toEqual({
      ok: true,
      kind: 'relocate_and_delete',
      items: [itemOf({ listId: 'list_hw' })],
    });
  });

  it('blocks delete when no other list exists to move into', () => {
    expect(
      prepareDeleteShoppingListPlan({
        actorId: 'user_julian',
        household: householdOf(),
        list: listOf(),
        lists: [listOf()],
        items: [itemOf()],
        moveToListId: 'list_hw',
      }),
    ).toEqual({ ok: false, reason: 'no_move_target' });
  });
});
