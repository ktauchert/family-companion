import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household, TodoItem } from '../types';
import {
  canCreateTodo,
  canDeleteTodo,
  canReadTodo,
  canUpdateTodo,
} from './permissions';

function householdOf(overrides: Partial<Household> = {}): Household {
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
    ...overrides,
  };
}

function todoOf(overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    id: 'todo_1',
    householdId: 'hh_1',
    createdBy: 'user_sophie',
    title: 'Einkaufen',
    status: 'todo',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'task',
    completions: [],
    ...overrides,
  };
}

describe('canDeleteTodo', () => {
  const household = householdOf();

  it('lets the owner delete a foreign todo', () => {
    expect(
      canDeleteTodo({
        actorId: 'user_julian',
        household,
        todo: todoOf({ createdBy: 'user_sophie' }),
      }),
    ).toBe(true);
  });

  it('denies a member deleting a foreign todo', () => {
    expect(
      canDeleteTodo({
        actorId: 'user_sophie',
        household,
        todo: todoOf({ createdBy: 'user_julian' }),
      }),
    ).toBe(false);
  });
});

describe('canUpdateTodo', () => {
  const household = householdOf();

  it('denies per_member completion for another member', () => {
    expect(
      canUpdateTodo({
        actorId: 'user_sophie',
        household,
        todo: todoOf({
          completionMode: 'per_member',
          completions: [
            { userId: 'user_julian', done: false },
            { userId: 'user_sophie', done: false },
          ],
        }),
        patch: {
          completions: [
            { userId: 'user_julian', done: true, doneAt: '2026-09-20T19:00:00.000Z' },
            { userId: 'user_sophie', done: false },
          ],
        },
      }),
    ).toBe(false);
  });
});

describe('canReadTodo / canCreateTodo', () => {
  const household = householdOf();

  it('allows members', () => {
    expect(canCreateTodo({ actorId: 'user_sophie', household })).toBe(true);
    expect(
      canReadTodo({ actorId: 'user_sophie', household, todo: todoOf() }),
    ).toBe(true);
  });

  it('denies non-members', () => {
    expect(canCreateTodo({ actorId: 'user_stranger', household })).toBe(false);
    expect(
      canReadTodo({ actorId: 'user_stranger', household, todo: todoOf() }),
    ).toBe(false);
  });
});
