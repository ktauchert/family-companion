import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household, MorningCheckIn, ShoppingItem, ShoppingList, TodoItem } from '../types';
import { defaultShoppingListId } from '../shopping/defaults';
import { prioritizeDay } from './prioritize';

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
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    },
  };
}

function eventOf(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt_1',
    householdId: 'hh_1',
    createdBy: 'user_julian',
    title: 'Elternabend',
    startsAt: '2026-09-15T18:00:00.000Z',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    completions: [],
    ...overrides,
  };
}

function shoppingListsOf(): ShoppingList[] {
  return [
    {
      id: defaultShoppingListId('hh_1', 'supermarket'),
      householdId: 'hh_1',
      name: 'Supermarkt',
      sortOrder: 0,
      createdBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    },
    {
      id: defaultShoppingListId('hh_1', 'drugstore'),
      householdId: 'hh_1',
      name: 'Drogerie',
      sortOrder: 1,
      createdBy: 'user_julian',
      createdAt: '2026-09-15T08:00:00.000Z',
    },
  ];
}

function todoOf(overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    id: 'todo_1',
    householdId: 'hh_1',
    createdBy: 'user_julian',
    title: 'Einkaufen',
    status: 'todo',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'task',
    completions: [],
    ...overrides,
  };
}

describe('prioritizeDay', () => {
  const household = householdOf();
  const date = '2026-09-15';

  it('sorts neutrally without check-ins and emits no suggestions', () => {
    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns: [],
      events: [eventOf({ id: 'evt_late', startsAt: '2026-09-15T20:00:00.000Z', title: 'Spät' })],
      todos: [todoOf({ id: 'todo_early', dueDate: '2026-09-15', title: 'Früh' })],
    });

    expect(result.suggestions).toEqual([]);
    expect(result.items.map((item) => item.id)).toEqual(['todo_early', 'evt_late']);
  });

  it('demotes high-energy items and suggests postpone when both are low', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'ci_j', householdId: 'hh_1', userId: 'user_julian', date, mood: 2, energy: 1 },
      { id: 'ci_s', householdId: 'hh_1', userId: 'user_sophie', date, mood: 2, energy: 2 },
    ];

    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns,
      events: [],
      todos: [
        todoOf({ id: 'todo_low', title: 'Kurz anrufen', energyHint: 'low' }),
        todoOf({ id: 'todo_high', title: 'Einkaufen', energyHint: 'high' }),
      ],
    });

    expect(result.items.map((item) => item.id)).toEqual(['todo_low', 'todo_high']);
    expect(result.suggestions.some((s) => s.type === 'postpone' && s.targetId === 'todo_high')).toBe(
      true,
    );
  });

  it('prioritizes open per_member habits before regular tasks', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'ci_j', householdId: 'hh_1', userId: 'user_julian', date, mood: 3, energy: 3 },
    ];

    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns,
      events: [],
      todos: [
        todoOf({ id: 'todo_task', title: 'Post abholen', kind: 'task', energyHint: 'low' }),
        todoOf({
          id: 'todo_habit',
          title: 'Zähne putzen',
          kind: 'habit',
          completionMode: 'per_member',
          energyHint: 'low',
        }),
      ],
      shoppingItems: [],
    });

    expect(result.items.map((item) => item.id)).toEqual(['todo_habit', 'todo_task']);
  });

  it('demotes unchecked shopping when both members are low on energy', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'ci_j', householdId: 'hh_1', userId: 'user_julian', date, mood: 2, energy: 1 },
      { id: 'ci_s', householdId: 'hh_1', userId: 'user_sophie', date, mood: 2, energy: 2 },
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

    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns,
      events: [],
      todos: [todoOf({ id: 'todo_low', title: 'Kurz anrufen', energyHint: 'low' })],
      shoppingItems,
      shoppingLists: shoppingListsOf(),
    });

    expect(result.items.map((item) => item.id)).toEqual([
      'todo_low',
      `shopping_${defaultShoppingListId('hh_1', 'supermarket')}`,
    ]);
  });

  it('aggregates open shopping items by list', () => {
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
      {
        id: 'shop_2',
        householdId: 'hh_1',
        name: 'Brot',
        listId: defaultShoppingListId('hh_1', 'supermarket'),
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:05:00.000Z',
      },
      {
        id: 'shop_3',
        householdId: 'hh_1',
        name: 'Shampoo',
        listId: defaultShoppingListId('hh_1', 'drugstore'),
        checked: false,
        addedBy: 'user_julian',
        createdAt: '2026-09-15T08:10:00.000Z',
      },
    ];

    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns: [],
      events: [],
      todos: [],
      shoppingItems,
      shoppingLists: shoppingListsOf(),
    });

    expect(result.items).toHaveLength(2);
    const supermarket = result.items.find(
      (item) => item.shoppingListId === defaultShoppingListId('hh_1', 'supermarket'),
    );
    expect(supermarket?.openCount).toBe(2);
    expect(supermarket?.title).toBe('Supermarkt');
  });

  it('suggests reassign when only one member has low energy', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'ci_j', householdId: 'hh_1', userId: 'user_julian', date, mood: 2, energy: 1 },
      { id: 'ci_s', householdId: 'hh_1', userId: 'user_sophie', date, mood: 4, energy: 4 },
    ];

    const result = prioritizeDay({
      household,
      actorId: 'user_julian',
      date,
      checkIns,
      events: [],
      todos: [
        todoOf({
          id: 'todo_shop',
          title: 'Einkaufen',
          energyHint: 'high',
          assignedTo: ['user_julian'],
        }),
      ],
      shoppingItems: [],
    });

    const reassign = result.suggestions.find((s) => s.type === 'reassign' && s.targetId === 'todo_shop');
    expect(reassign?.suggestedAssignee).toBe('user_sophie');
    expect(reassign?.replacedAssignee).toBe('user_julian');
  });
});
