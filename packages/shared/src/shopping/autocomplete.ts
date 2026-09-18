import type { ShoppingItem } from '../types';

export const SHOPPING_ITEM_NAME_AUTOCOMPLETE_MIN_LENGTH = 3;

export function suggestShoppingItemNames(input: {
  query: string;
  items: ShoppingItem[];
  limit?: number;
}): string[] {
  const needle = input.query.trim().toLocaleLowerCase('de');
  if (needle.length < SHOPPING_ITEM_NAME_AUTOCOMPLETE_MIN_LENGTH) {
    return [];
  }

  const seen = new Set<string>();
  const matches: string[] = [];

  for (const item of input.items) {
    const name = item.name.trim();
    if (name.length === 0) {
      continue;
    }
    const key = name.toLocaleLowerCase('de');
    if (seen.has(key) || !key.includes(needle)) {
      continue;
    }
    seen.add(key);
    matches.push(name);
  }

  matches.sort((left, right) => {
    const leftLower = left.toLocaleLowerCase('de');
    const rightLower = right.toLocaleLowerCase('de');
    const leftStarts = leftLower.startsWith(needle);
    const rightStarts = rightLower.startsWith(needle);
    if (leftStarts !== rightStarts) {
      return leftStarts ? -1 : 1;
    }
    return left.localeCompare(right, 'de');
  });

  return matches.slice(0, input.limit ?? 8);
}
