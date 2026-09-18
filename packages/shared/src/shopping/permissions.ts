import { isHouseholdMember, isHouseholdOwner } from '../household/access';
import type { Household, ShoppingItem, ShoppingList } from '../types';
import { isShoppingListInHousehold } from './defaults';

export type ShoppingItemAccessContext = {
  actorId: string;
  household: Household;
  item: ShoppingItem;
};

export function canReadShoppingItem(ctx: ShoppingItemAccessContext): boolean {
  return (
    isHouseholdMember(ctx.actorId, ctx.household) && ctx.item.householdId === ctx.household.id
  );
}

export function canCreateShoppingItem(ctx: { actorId: string; household: Household }): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household);
}

export function canDeleteShoppingItem(ctx: ShoppingItemAccessContext): boolean {
  if (!canReadShoppingItem(ctx)) {
    return false;
  }
  return isHouseholdOwner(ctx.actorId, ctx.household) || ctx.item.addedBy === ctx.actorId;
}

export function canUpdateShoppingItem(ctx: {
  actorId: string;
  household: Household;
  item: ShoppingItem;
  patch: Partial<ShoppingItem>;
  lists: ShoppingList[];
}): boolean {
  if (!canReadShoppingItem({ actorId: ctx.actorId, household: ctx.household, item: ctx.item })) {
    return false;
  }

  if (ctx.patch.householdId !== undefined && ctx.patch.householdId !== ctx.item.householdId) {
    return false;
  }
  if (ctx.patch.addedBy !== undefined && ctx.patch.addedBy !== ctx.item.addedBy) {
    return false;
  }
  if (ctx.patch.id !== undefined && ctx.patch.id !== ctx.item.id) {
    return false;
  }
  if (ctx.patch.createdAt !== undefined && ctx.patch.createdAt !== ctx.item.createdAt) {
    return false;
  }

  const nextListId = ctx.patch.listId ?? ctx.item.listId;
  if (!isShoppingListInHousehold(nextListId, ctx.household.id, ctx.lists)) {
    return false;
  }

  return true;
}
