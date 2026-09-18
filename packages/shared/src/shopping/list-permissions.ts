import { isHouseholdMember, isHouseholdOwner } from '../household/access';
import type { Household, ShoppingList } from '../types';

export type ShoppingListAccessContext = {
  actorId: string;
  household: Household;
  list: ShoppingList;
};

export function canReadShoppingList(ctx: ShoppingListAccessContext): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household) && ctx.list.householdId === ctx.household.id;
}

export function canCreateShoppingList(ctx: { actorId: string; household: Household }): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household);
}

export function canUpdateShoppingList(ctx: ShoppingListAccessContext): boolean {
  return canReadShoppingList(ctx);
}

export function canDeleteShoppingList(ctx: ShoppingListAccessContext): boolean {
  if (!canReadShoppingList(ctx)) {
    return false;
  }
  return isHouseholdOwner(ctx.actorId, ctx.household);
}
