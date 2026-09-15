import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import { prepareCreateShoppingItem, prepareToggleShoppingItemChecked } from './item';

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

describe('prepareCreateShoppingItem', () => {
  it('creates an item with addedBy', () => {
    const result = prepareCreateShoppingItem({
      actorId: 'user_sophie',
      household: householdOf(),
      itemId: 'shop_new',
      name: ' Milch ',
      category: 'supermarket',
      createdAt: '2026-09-20T10:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      item: {
        id: 'shop_new',
        householdId: 'hh_1',
        name: 'Milch',
        category: 'supermarket',
        checked: false,
        addedBy: 'user_sophie',
        createdAt: '2026-09-20T10:00:00.000Z',
      },
    });
  });

  it('rejects invalid categories', () => {
    expect(
      prepareCreateShoppingItem({
        actorId: 'user_sophie',
        household: householdOf(),
        itemId: 'shop_new',
        name: 'Milch',
        category: 'bakery' as 'supermarket',
        createdAt: '2026-09-20T10:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'invalid_category' });
  });
});

describe('prepareToggleShoppingItemChecked', () => {
  it('sets checkedAt when checking off', () => {
    const household = householdOf();
    const item = {
      id: 'shop_1',
      householdId: 'hh_1',
      name: 'Milch',
      category: 'supermarket' as const,
      checked: false,
      addedBy: 'user_sophie',
      createdAt: '2026-09-20T10:00:00.000Z',
    };

    const result = prepareToggleShoppingItemChecked({
      actorId: 'user_julian',
      household,
      item,
      checked: true,
      checkedAt: '2026-09-20T11:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      item: { ...item, checked: true, checkedAt: '2026-09-20T11:00:00.000Z' },
    });
  });
});
