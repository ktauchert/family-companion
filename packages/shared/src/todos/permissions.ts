import { isHouseholdMember, isHouseholdOwner } from '../household/access';
import type { Household, MemberCompletion, TodoItem } from '../types';

export type TodoAccessContext = {
  actorId: string;
  household: Household;
  todo: TodoItem;
};

export function canReadTodo(ctx: TodoAccessContext): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household) && ctx.todo.householdId === ctx.household.id;
}

export function canCreateTodo(ctx: { actorId: string; household: Household }): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household);
}

export function canDeleteTodo(ctx: TodoAccessContext): boolean {
  if (!canReadTodo(ctx)) {
    return false;
  }
  return isHouseholdOwner(ctx.actorId, ctx.household) || ctx.todo.createdBy === ctx.actorId;
}

function completionEntryChanged(
  before: MemberCompletion | undefined,
  after: MemberCompletion | undefined,
): boolean {
  return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
}

function canUpdateCompletions(
  actorId: string,
  todo: TodoItem,
  nextCompletions: MemberCompletion[],
): boolean {
  if (todo.completionMode === 'household') {
    return true;
  }

  const prevByUser = new Map(todo.completions.map((entry) => [entry.userId, entry]));
  const nextByUser = new Map(nextCompletions.map((entry) => [entry.userId, entry]));
  const userIds = new Set([...prevByUser.keys(), ...nextByUser.keys()]);

  for (const userId of userIds) {
    if (completionEntryChanged(prevByUser.get(userId), nextByUser.get(userId)) && userId !== actorId) {
      return false;
    }
  }

  return true;
}

export function canUpdateTodo(ctx: {
  actorId: string;
  household: Household;
  todo: TodoItem;
  patch: Partial<TodoItem>;
}): boolean {
  if (!canReadTodo({ actorId: ctx.actorId, household: ctx.household, todo: ctx.todo })) {
    return false;
  }

  if (ctx.patch.householdId !== undefined && ctx.patch.householdId !== ctx.todo.householdId) {
    return false;
  }
  if (ctx.patch.createdBy !== undefined && ctx.patch.createdBy !== ctx.todo.createdBy) {
    return false;
  }
  if (ctx.patch.id !== undefined && ctx.patch.id !== ctx.todo.id) {
    return false;
  }

  if (ctx.patch.completions !== undefined) {
    return canUpdateCompletions(ctx.actorId, ctx.todo, ctx.patch.completions);
  }

  return true;
}
