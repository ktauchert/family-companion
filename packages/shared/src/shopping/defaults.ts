import { SHOPPING_CATEGORIES } from '../firebase/config';
import type { ShoppingCategory, ShoppingList } from '../types';

export type DefaultShoppingListSpec = {
  legacyCategory: ShoppingCategory;
  name: string;
  sortOrder: number;
};

export const DEFAULT_SHOPPING_LIST_SPECS: readonly DefaultShoppingListSpec[] = [
  { legacyCategory: 'supermarket', name: 'Supermarkt', sortOrder: 0 },
  { legacyCategory: 'drugstore', name: 'Drogerie', sortOrder: 1 },
  { legacyCategory: 'pharmacy', name: 'Apotheke', sortOrder: 2 },
  { legacyCategory: 'clothing', name: 'Klamotten', sortOrder: 3 },
  { legacyCategory: 'other', name: 'Sonstiges', sortOrder: 4 },
] as const;

export function defaultShoppingListId(householdId: string, legacyCategory: ShoppingCategory): string {
  return `${householdId}_${legacyCategory}`;
}

export function parseDefaultShoppingListCategory(
  listId: string,
  householdId: string,
): ShoppingCategory | undefined {
  const prefix = `${householdId}_`;
  if (!listId.startsWith(prefix)) {
    return undefined;
  }
  const suffix = listId.slice(prefix.length);
  return (SHOPPING_CATEGORIES as readonly string[]).includes(suffix)
    ? (suffix as ShoppingCategory)
    : undefined;
}

export function defaultShoppingListsForHousehold(input: {
  householdId: string;
  createdBy: string;
  createdAt: string;
}): ShoppingList[] {
  return DEFAULT_SHOPPING_LIST_SPECS.map((spec) => ({
    id: defaultShoppingListId(input.householdId, spec.legacyCategory),
    householdId: input.householdId,
    name: spec.name,
    sortOrder: spec.sortOrder,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  }));
}

export function missingDefaultShoppingLists(
  existing: ShoppingList[],
  input: { householdId: string; createdBy: string; createdAt: string },
): ShoppingList[] {
  const existingIds = new Set(existing.map((list) => list.id));
  return defaultShoppingListsForHousehold(input).filter((list) => !existingIds.has(list.id));
}

export function isShoppingListInHousehold(
  listId: string,
  householdId: string,
  lists: ShoppingList[],
): boolean {
  return lists.some((list) => list.id === listId && list.householdId === householdId);
}

export function shoppingListName(listId: string, lists: ShoppingList[]): string | undefined {
  return lists.find((list) => list.id === listId)?.name;
}
