import { isHouseholdMember } from '../household/access';
import type { Household, ShoppingItem, ShoppingList } from '../types';
import { isShoppingListInHousehold } from './defaults';
import { canUpdateShoppingItem } from './permissions';

export type CreateShoppingItemInput = {
  actorId: string;
  household: Household;
  itemId: string;
  name: string;
  listId: string;
  lists: ShoppingList[];
  createdAt: string;
};

export type CreateShoppingItemResult =
  | { ok: true; item: ShoppingItem }
  | {
      ok: false;
      reason: 'not_member' | 'name_required' | 'invalid_list';
    };

export type UpdateShoppingItemResult =
  | { ok: true; item: ShoppingItem }
  | {
      ok: false;
      reason: 'not_allowed' | 'name_required' | 'invalid_list';
    };

export function prepareCreateShoppingItem(input: CreateShoppingItemInput): CreateShoppingItemResult {
  if (!isHouseholdMember(input.actorId, input.household)) {
    return { ok: false, reason: 'not_member' };
  }

  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!isShoppingListInHousehold(input.listId, input.household.id, input.lists)) {
    return { ok: false, reason: 'invalid_list' };
  }

  const item: ShoppingItem = {
    id: input.itemId,
    householdId: input.household.id,
    name,
    listId: input.listId,
    checked: false,
    addedBy: input.actorId,
    createdAt: input.createdAt,
  };

  return { ok: true, item };
}

export function prepareUpdateShoppingItem(input: {
  actorId: string;
  household: Household;
  item: ShoppingItem;
  patch: Partial<ShoppingItem>;
  lists: ShoppingList[];
}): UpdateShoppingItemResult {
  if (
    !canUpdateShoppingItem({
      actorId: input.actorId,
      household: input.household,
      item: input.item,
      patch: input.patch,
      lists: input.lists,
    })
  ) {
    return { ok: false, reason: 'not_allowed' };
  }

  const next: ShoppingItem = { ...input.item, ...input.patch };

  const name = next.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!isShoppingListInHousehold(next.listId, input.household.id, input.lists)) {
    return { ok: false, reason: 'invalid_list' };
  }

  return { ok: true, item: { ...next, name } };
}

/** Firestore may return legacy truthy values; only strict true counts as checked off. */
export function normalizeShoppingItemChecked(value: unknown): boolean {
  return value === true;
}

export function isShoppingItemOpen(item: Pick<ShoppingItem, 'checked'>): boolean {
  return !normalizeShoppingItemChecked(item.checked);
}

export function prepareToggleShoppingItemChecked(input: {
  actorId: string;
  household: Household;
  item: ShoppingItem;
  lists: ShoppingList[];
  checked: boolean;
  checkedAt: string;
}): UpdateShoppingItemResult {
  const patch: Partial<ShoppingItem> = {
    checked: input.checked,
    checkedAt: input.checked ? input.checkedAt : undefined,
  };

  return prepareUpdateShoppingItem({
    actorId: input.actorId,
    household: input.household,
    item: input.item,
    patch,
    lists: input.lists,
  });
}

export function createShoppingItemErrorMessage(
  reason: 'not_member' | 'name_required' | 'invalid_list' | 'not_allowed',
): string {
  switch (reason) {
    case 'not_member':
      return 'Du gehörst nicht zu diesem Haushalt.';
    case 'name_required':
      return 'Bitte einen Namen eingeben.';
    case 'invalid_list':
      return 'Ungültige Liste.';
    case 'not_allowed':
      return 'Diese Änderung ist nicht erlaubt.';
  }
}
