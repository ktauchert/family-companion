import { initialCompletionsForMode } from '../calendar/completion';
import type { Household, TodoItem } from '../types';
import { canUpdateTodo } from './permissions';

export { initialCompletionsForMode };

export function isTodoDone(todo: TodoItem): boolean {
  if (todo.completionMode === 'household') {
    return todo.completions.some((entry) => entry.done);
  }
  return todo.completions.length > 0 && todo.completions.every((entry) => entry.done);
}

export function isTodoDoneForUser(todo: TodoItem, userId: string): boolean {
  if (todo.completionMode === 'household') {
    return isTodoDone(todo);
  }
  return todo.completions.find((entry) => entry.userId === userId)?.done ?? false;
}

export function todoStatusFromCompletions(todo: TodoItem): TodoItem['status'] {
  return isTodoDone(todo) ? 'done' : 'todo';
}

export type ToggleTodoCompletionResult =
  | { ok: true; todo: TodoItem }
  | { ok: false; reason: 'not_allowed' };

export function prepareToggleTodoCompletion(input: {
  actorId: string;
  household: Household;
  todo: TodoItem;
  done: boolean;
  doneAt: string;
}): ToggleTodoCompletionResult {
  let nextCompletions: TodoItem['completions'];

  if (input.todo.completionMode === 'household') {
    nextCompletions = input.done
      ? [{ userId: input.actorId, done: true, doneAt: input.doneAt }]
      : [];
  } else {
    const byUser = new Map(input.todo.completions.map((entry) => [entry.userId, entry]));
    for (const userId of input.household.members) {
      if (!byUser.has(userId)) {
        byUser.set(userId, { userId, done: false });
      }
    }
    const actorEntry = byUser.get(input.actorId);
    if (!actorEntry) {
      return { ok: false, reason: 'not_allowed' };
    }
    byUser.set(input.actorId, {
      ...actorEntry,
      done: input.done,
      doneAt: input.done ? input.doneAt : undefined,
    });
    nextCompletions = input.household.members.map((userId) => byUser.get(userId)!);
  }

  const nextTodo: TodoItem = {
    ...input.todo,
    completions: nextCompletions,
    status: 'todo',
  };
  nextTodo.status = todoStatusFromCompletions(nextTodo);

  if (
    !canUpdateTodo({
      actorId: input.actorId,
      household: input.household,
      todo: input.todo,
      patch: { completions: nextCompletions, status: nextTodo.status },
    })
  ) {
    return { ok: false, reason: 'not_allowed' };
  }

  return { ok: true, todo: nextTodo };
}
