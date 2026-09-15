import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { Household } from '../types';
import { prepareCreateTodo } from './item';

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

describe('prepareCreateTodo', () => {
  it('creates a todo with createdBy', () => {
    const result = prepareCreateTodo({
      actorId: 'user_sophie',
      household: householdOf(),
      todoId: 'todo_new',
      title: ' Wäsche ',
      dueDate: '2026-09-21',
    });

    expect(result).toEqual({
      ok: true,
      todo: {
        id: 'todo_new',
        householdId: 'hh_1',
        createdBy: 'user_sophie',
        title: 'Wäsche',
        status: 'todo',
        dueDate: '2026-09-21',
        completionMode: 'household',
        recurrence: 'none',
        kind: 'task',
        completions: [],
      },
    });
  });
});
