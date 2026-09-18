import type { ShoppingCategory, ShoppingItem } from '../types';
import { defaultShoppingListId } from './defaults';
import { normalizeShoppingItemChecked } from './item';

export type LegacyShoppingItem = Omit<ShoppingItem, 'listId'> & {
  listId?: string;
  category?: ShoppingCategory;
};

export function normalizeShoppingItem(raw: LegacyShoppingItem): ShoppingItem {
  if (raw.listId) {
    const { category: _legacy, ...item } = raw;
    return {
      ...(item as ShoppingItem),
      checked: normalizeShoppingItemChecked(item.checked),
    };
  }

  if (raw.category) {
    const { category, ...rest } = raw;
    return {
      ...rest,
      listId: defaultShoppingListId(raw.householdId, category),
      checked: normalizeShoppingItemChecked(rest.checked),
    };
  }

  throw new Error('Shopping item missing listId');
}

export function shoppingItemNeedsListMigration(raw: LegacyShoppingItem): boolean {
  return !raw.listId && Boolean(raw.category);
}
