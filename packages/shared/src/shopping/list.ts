import { isHouseholdMember } from '../household/access';
import type { Household, ShoppingItem, ShoppingList } from '../types';
import { isShoppingListInHousehold } from './defaults';
import { prepareUpdateShoppingItem } from './item';
import { canDeleteShoppingList, canUpdateShoppingList } from './list-permissions';

export type CreateShoppingListInput = {
  actorId: string;
  household: Household;
  listId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
};

export type CreateShoppingListResult =
  | { ok: true; list: ShoppingList }
  | { ok: false; reason: 'not_member' | 'name_required' | 'invalid_sort_order' };

export type UpdateShoppingListResult =
  | { ok: true; list: ShoppingList }
  | { ok: false; reason: 'not_allowed' | 'name_required' | 'invalid_sort_order' };

export type DeleteShoppingListResult =
  | { ok: true }
  | { ok: false; reason: 'not_allowed' | 'list_has_items' };

export type DeleteShoppingListPlanResult =
  | { ok: true; kind: 'delete_only' }
  | { ok: true; kind: 'relocate_and_delete'; items: ShoppingItem[] }
  | {
      ok: false;
      reason: 'not_allowed' | 'list_has_items' | 'invalid_move_target' | 'no_move_target';
    };

export function nextShoppingListSortOrder(lists: ShoppingList[]): number {
  if (lists.length === 0) {
    return 0;
  }
  return Math.max(...lists.map((list) => list.sortOrder)) + 1;
}

export function shoppingListDeleteTargets(
  sourceListId: string,
  lists: ShoppingList[],
): ShoppingList[] {
  return lists.filter((list) => list.id !== sourceListId);
}

export function prepareRelocateShoppingItems(input: {
  actorId: string;
  household: Household;
  items: ShoppingItem[];
  fromListId: string;
  toListId: string;
  lists: ShoppingList[];
}):
  | { ok: true; items: ShoppingItem[] }
  | { ok: false; reason: 'invalid_move_target' | 'not_allowed' } {
  if (
    input.fromListId === input.toListId
    || !isShoppingListInHousehold(input.toListId, input.household.id, input.lists)
  ) {
    return { ok: false, reason: 'invalid_move_target' };
  }

  const updated: ShoppingItem[] = [];
  for (const item of input.items) {
    if (item.listId !== input.fromListId) {
      continue;
    }
    const result = prepareUpdateShoppingItem({
      actorId: input.actorId,
      household: input.household,
      item,
      patch: { listId: input.toListId },
      lists: input.lists,
    });
    if (!result.ok) {
      return { ok: false, reason: 'not_allowed' };
    }
    updated.push(result.item);
  }

  return { ok: true, items: updated };
}

export function prepareDeleteShoppingListPlan(input: {
  actorId: string;
  household: Household;
  list: ShoppingList;
  lists: ShoppingList[];
  items: ShoppingItem[];
  moveToListId?: string;
}): DeleteShoppingListPlanResult {
  const itemsInList = input.items.filter((item) => item.listId === input.list.id);
  const base = prepareDeleteShoppingList({
    actorId: input.actorId,
    household: input.household,
    list: input.list,
    itemCount: itemsInList.length,
  });

  if (!base.ok) {
    if (base.reason !== 'list_has_items') {
      return base;
    }

    const targets = shoppingListDeleteTargets(input.list.id, input.lists);
    if (targets.length === 0) {
      return { ok: false, reason: 'no_move_target' };
    }
    if (!input.moveToListId) {
      return { ok: false, reason: 'list_has_items' };
    }

    const relocate = prepareRelocateShoppingItems({
      actorId: input.actorId,
      household: input.household,
      items: input.items,
      fromListId: input.list.id,
      toListId: input.moveToListId,
      lists: input.lists,
    });
    if (!relocate.ok) {
      return { ok: false, reason: 'invalid_move_target' };
    }

    return { ok: true, kind: 'relocate_and_delete', items: relocate.items };
  }

  return { ok: true, kind: 'delete_only' };
}

export function prepareCreateShoppingList(input: CreateShoppingListInput): CreateShoppingListResult {
  if (!isHouseholdMember(input.actorId, input.household)) {
    return { ok: false, reason: 'not_member' };
  }

  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    return { ok: false, reason: 'invalid_sort_order' };
  }

  return {
    ok: true,
    list: {
      id: input.listId,
      householdId: input.household.id,
      name,
      sortOrder: input.sortOrder,
      createdBy: input.actorId,
      createdAt: input.createdAt,
    },
  };
}

export function prepareUpdateShoppingList(input: {
  actorId: string;
  household: Household;
  list: ShoppingList;
  patch: Partial<Pick<ShoppingList, 'name' | 'sortOrder'>>;
}): UpdateShoppingListResult {
  if (!canUpdateShoppingList({ actorId: input.actorId, household: input.household, list: input.list })) {
    return { ok: false, reason: 'not_allowed' };
  }

  const next: ShoppingList = { ...input.list, ...input.patch };
  const name = next.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!Number.isInteger(next.sortOrder) || next.sortOrder < 0) {
    return { ok: false, reason: 'invalid_sort_order' };
  }

  return { ok: true, list: { ...next, name } };
}

export function prepareDeleteShoppingList(input: {
  actorId: string;
  household: Household;
  list: ShoppingList;
  itemCount: number;
}): DeleteShoppingListResult {
  if (!canDeleteShoppingList({ actorId: input.actorId, household: input.household, list: input.list })) {
    return { ok: false, reason: 'not_allowed' };
  }

  if (input.itemCount > 0) {
    return { ok: false, reason: 'list_has_items' };
  }

  return { ok: true };
}

export function createShoppingListErrorMessage(
  reason:
    | 'not_member'
    | 'name_required'
    | 'invalid_sort_order'
    | 'not_allowed'
    | 'list_has_items'
    | 'invalid_move_target'
    | 'no_move_target',
): string {
  switch (reason) {
    case 'not_member':
      return 'Du gehörst nicht zu diesem Haushalt.';
    case 'name_required':
      return 'Bitte einen Listennamen eingeben.';
    case 'invalid_sort_order':
      return 'Ungültige Reihenfolge.';
    case 'not_allowed':
      return 'Diese Änderung ist nicht erlaubt.';
    case 'list_has_items':
      return 'Liste enthält noch Artikel. Bitte zuerst verschieben.';
    case 'invalid_move_target':
      return 'Ziel-Liste ist ungültig.';
    case 'no_move_target':
      return 'Es gibt keine andere Liste zum Verschieben.';
  }
}
