import { isHouseholdMember } from '../household/access';
import { SHOPPING_CATEGORIES } from '../firebase/config';
import type { Household, ShoppingCategory, ShoppingItem } from '../types';
import { canUpdateShoppingItem } from './permissions';

export type CreateShoppingItemInput = {
  actorId: string;
  household: Household;
  itemId: string;
  name: string;
  category: ShoppingCategory;
  createdAt: string;
};

export type CreateShoppingItemResult =
  | { ok: true; item: ShoppingItem }
  | {
      ok: false;
      reason: 'not_member' | 'name_required' | 'invalid_category';
    };

export type UpdateShoppingItemResult =
  | { ok: true; item: ShoppingItem }
  | {
      ok: false;
      reason: 'not_allowed' | 'name_required' | 'invalid_category';
    };

export function isValidShoppingCategory(category: string): category is ShoppingCategory {
  return (SHOPPING_CATEGORIES as readonly string[]).includes(category);
}

export function prepareCreateShoppingItem(input: CreateShoppingItemInput): CreateShoppingItemResult {
  if (!isHouseholdMember(input.actorId, input.household)) {
    return { ok: false, reason: 'not_member' };
  }

  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!isValidShoppingCategory(input.category)) {
    return { ok: false, reason: 'invalid_category' };
  }

  const item: ShoppingItem = {
    id: input.itemId,
    householdId: input.household.id,
    name,
    category: input.category,
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
}): UpdateShoppingItemResult {
  if (!canUpdateShoppingItem(input)) {
    return { ok: false, reason: 'not_allowed' };
  }

  const next: ShoppingItem = { ...input.item, ...input.patch };

  const name = next.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name_required' };
  }

  if (!isValidShoppingCategory(next.category)) {
    return { ok: false, reason: 'invalid_category' };
  }

  return { ok: true, item: { ...next, name } };
}

export function prepareToggleShoppingItemChecked(input: {
  actorId: string;
  household: Household;
  item: ShoppingItem;
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
  });
}

export function createShoppingItemErrorMessage(
  reason: 'not_member' | 'name_required' | 'invalid_category' | 'not_allowed',
): string {
  switch (reason) {
    case 'not_member':
      return 'Du gehörst nicht zu diesem Haushalt.';
    case 'name_required':
      return 'Bitte einen Namen eingeben.';
    case 'invalid_category':
      return 'Ungültiges Thema.';
    case 'not_allowed':
      return 'Diese Änderung ist nicht erlaubt.';
  }
}
