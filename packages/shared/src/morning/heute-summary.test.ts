import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household, ShoppingItem, TodoItem } from '../types';
import { defaultShoppingListId } from '../shopping/defaults';
import { buildHeuteAreaSummaries } from './heute-summary';

function householdOf(): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    members: ['user_julian'],
    memberEmails: { user_julian: 'julian@home.de' },
  };
}

describe('buildHeuteAreaSummaries', () => {
  const date = '2026-09-15';
  const household = householdOf();

  it('summarizes next calendar event, open todos and shopping', () => {
    const events: CalendarEvent[] = [
      {
        id: 'evt_1',
        householdId: 'hh_1',
        createdBy: 'user_julian',
        title: 'Elternabend',
        startsAt: '2026-09-15T18:00:00.000Z',
        completionMode: 'household',
        recurrence: 'none',
        kind: 'event',
        completions: [],
      },
    ];
    const todos: TodoItem[] = [
      {
        id: 'todo_1',
        householdId: 'hh_1',
        createdBy: 'user_julian',
        title: 'Post',
        status: 'todo',
        dueDate: '2026-09-14',
        completionMode: 'household',
        recurrence: 'none',
        kind: 'task',
        completions: [],
      },
    ];
    const shoppingItems: ShoppingItem[] = [
      {
        id: 'shop_1',
        householdId: 'hh_1',
        name: 'Milch',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:00:00.000Z',
      },
    ];

    const summaries = buildHeuteAreaSummaries({
      household,
      actorId: 'user_julian',
      date,
      events,
      todos,
      shoppingItems,
    });

    expect(summaries.kalender.line).toContain('Elternabend');
    expect(summaries.todos.line).toContain('überfällig');
    expect(summaries.listen.line).toBe('1 Artikel offen');
  });

  it('counts only unchecked shopping items on the listen summary', () => {
    const shoppingItems: ShoppingItem[] = [
      {
        id: 'shop_1',
        householdId: 'hh_1',
        name: 'Milch',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: true,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:00:00.000Z',
      },
      {
        id: 'shop_2',
        householdId: 'hh_1',
        name: 'Brot',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: true,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:05:00.000Z',
      },
      {
        id: 'shop_3',
        householdId: 'hh_1',
        name: 'Butter',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: true,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:10:00.000Z',
      },
      {
        id: 'shop_4',
        householdId: 'hh_1',
        name: 'Eier',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:15:00.000Z',
      },
      {
        id: 'shop_5',
        householdId: 'hh_1',
        name: 'Käse',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:20:00.000Z',
      },
    ];

    const summaries = buildHeuteAreaSummaries({
      household,
      actorId: 'user_julian',
      date,
      events: [],
      todos: [],
      shoppingItems,
    });

    expect(summaries.listen.line).toBe('2 Artikel offen');
  });

  it('uses empty-state copy when nothing is open', () => {
    const summaries = buildHeuteAreaSummaries({
      household,
      actorId: 'user_julian',
      date,
      events: [],
      todos: [],
      shoppingItems: [],
    });

    expect(summaries.kalender.line).toBe('Keine Termine heute');
    expect(summaries.todos.line).toBe('Keine offenen Todos');
    expect(summaries.listen.line).toBe('Nichts auf den Listen');
  });
});
