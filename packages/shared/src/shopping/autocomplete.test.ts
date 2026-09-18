import { describe, expect, it } from 'vitest';
import type { ShoppingItem } from '../types';
import {
  SHOPPING_ITEM_NAME_AUTOCOMPLETE_MIN_LENGTH,
  suggestShoppingItemNames,
} from './autocomplete';

function itemOf(name: string, id = name): ShoppingItem {
  return {
    id,
    householdId: 'hh_1',
    name,
    listId: 'hh_1_supermarket',
    checked: false,
    addedBy: 'user_julian',
    createdAt: '2026-09-15T08:00:00.000Z',
  };
}

describe('suggestShoppingItemNames', () => {
  it('exports minimum length of three characters', () => {
    expect(SHOPPING_ITEM_NAME_AUTOCOMPLETE_MIN_LENGTH).toBe(3);
  });

  it('returns no suggestions before three characters', () => {
    expect(
      suggestShoppingItemNames({
        query: 'Mi',
        items: [itemOf('Milch'), itemOf('Vollmilch 3,5%', 'shop_2')],
      }),
    ).toEqual([]);
  });

  it('matches partial names case-insensitively across the household', () => {
    expect(
      suggestShoppingItemNames({
        query: 'milch',
        items: [itemOf('Vollmilch 3,5%', 'shop_2'), itemOf('Milch')],
      }),
    ).toEqual(['Milch', 'Vollmilch 3,5%']);
  });

  it('deduplicates names and ignores blank entries', () => {
    expect(
      suggestShoppingItemNames({
        query: 'brot',
        items: [
          itemOf('Brot'),
          itemOf('Brot', 'shop_dup'),
          itemOf('   ', 'shop_blank'),
          itemOf('Vollkornbrot', 'shop_vk'),
        ],
      }),
    ).toEqual(['Brot', 'Vollkornbrot']);
  });

  it('prefers names that start with the query', () => {
    expect(
      suggestShoppingItemNames({
        query: 'Sal',
        items: [itemOf('Meersalz', 'shop_2'), itemOf('Salz')],
      }),
    ).toEqual(['Salz', 'Meersalz']);
  });

  it('respects the result limit', () => {
    expect(
      suggestShoppingItemNames({
        query: 'tee',
        items: [
          itemOf('Tee'),
          itemOf('Grüner Tee'),
          itemOf('Kräutertee'),
          itemOf('Matcha-Tee'),
        ],
        limit: 2,
      }),
    ).toHaveLength(2);
  });
});
