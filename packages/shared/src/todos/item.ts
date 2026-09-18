import { isHouseholdMember } from '../household/access';
import { resolveMandatoryDaily } from '../habits/mandatory-daily';
import type { CompletionMode, EnergyBand, Household, Recurrence, TodoItem } from '../types';
import { initialCompletionsForMode, todoStatusFromCompletions } from './completion';
import { canUpdateTodo } from './permissions';

export type CreateTodoInput = {
  actorId: string;
  household: Household;
  todoId: string;
  title: string;
  dueDate?: string;
  assignedTo?: string[];
  completionMode?: CompletionMode;
  recurrence?: Recurrence;
  kind?: TodoItem['kind'];
  mandatoryDaily?: boolean;
  energyHint?: EnergyBand;
};

export type CreateTodoResult =
  | { ok: true; todo: TodoItem }
  | {
      ok: false;
      reason:
        | 'not_member'
        | 'title_required'
        | 'invalid_assignee'
        | 'pro_required'
        | 'invalid_mandatory';
    };

export type UpdateTodoResult =
  | { ok: true; todo: TodoItem }
  | {
      ok: false;
      reason:
        | 'not_allowed'
        | 'title_required'
        | 'invalid_assignee'
        | 'pro_required'
        | 'invalid_mandatory';
    };

export function prepareCreateTodo(input: CreateTodoInput): CreateTodoResult {
  if (!isHouseholdMember(input.actorId, input.household)) {
    return { ok: false, reason: 'not_member' };
  }

  const title = input.title.trim();
  if (title.length === 0) {
    return { ok: false, reason: 'title_required' };
  }

  if (input.assignedTo) {
    for (const userId of input.assignedTo) {
      if (!input.household.members.includes(userId)) {
        return { ok: false, reason: 'invalid_assignee' };
      }
    }
  }

  const completionMode = input.completionMode ?? 'household';
  const kind = input.kind ?? 'task';
  const recurrence = input.recurrence ?? 'none';
  const completions = initialCompletionsForMode(input.household, completionMode);

  const mandatory = resolveMandatoryDaily(input.household, {
    mandatoryDaily: input.mandatoryDaily,
    kind,
    recurrence,
  });
  if (!mandatory.ok) {
    return { ok: false, reason: mandatory.reason };
  }

  const todo: TodoItem = {
    id: input.todoId,
    householdId: input.household.id,
    createdBy: input.actorId,
    title,
    status: 'todo',
    dueDate: input.dueDate,
    assignedTo: input.assignedTo,
    completionMode,
    recurrence,
    kind,
    mandatoryDaily: mandatory.mandatoryDaily,
    energyHint: input.energyHint,
    completions,
  };

  return { ok: true, todo };
}

export function prepareUpdateTodo(input: {
  actorId: string;
  household: Household;
  todo: TodoItem;
  patch: Partial<TodoItem>;
}): UpdateTodoResult {
  if (!canUpdateTodo(input)) {
    return { ok: false, reason: 'not_allowed' };
  }

  const next: TodoItem = { ...input.todo, ...input.patch };

  if (
    input.patch.completionMode !== undefined &&
    input.patch.completionMode !== input.todo.completionMode
  ) {
    next.completions = initialCompletionsForMode(input.household, next.completionMode);
    next.status = 'todo';
  }

  const title = next.title.trim();
  if (title.length === 0) {
    return { ok: false, reason: 'title_required' };
  }

  if (next.assignedTo) {
    for (const userId of next.assignedTo) {
      if (!input.household.members.includes(userId)) {
        return { ok: false, reason: 'invalid_assignee' };
      }
    }
  }

  const mandatory = resolveMandatoryDaily(input.household, {
    mandatoryDaily: next.mandatoryDaily,
    kind: next.kind,
    recurrence: next.recurrence,
  });
  if (!mandatory.ok) {
    return { ok: false, reason: mandatory.reason };
  }
  next.mandatoryDaily = mandatory.mandatoryDaily;

  next.status = todoStatusFromCompletions({ ...next, title });

  return { ok: true, todo: { ...next, title } };
}

import { mandatoryDailyErrorMessage } from '../habits/mandatory-daily';

export function createTodoErrorMessage(
  reason:
    | 'not_member'
    | 'title_required'
    | 'invalid_assignee'
    | 'not_allowed'
    | 'pro_required'
    | 'invalid_mandatory',
): string {
  switch (reason) {
    case 'not_member':
      return 'Du gehörst nicht zu diesem Haushalt.';
    case 'title_required':
      return 'Bitte einen Titel eingeben.';
    case 'invalid_assignee':
      return 'Zuweisung muss ein Haushaltsmitglied sein.';
    case 'not_allowed':
      return 'Diese Änderung ist nicht erlaubt.';
    case 'pro_required':
      return mandatoryDailyErrorMessage('pro_required');
    case 'invalid_mandatory':
      return mandatoryDailyErrorMessage('invalid_mandatory');
  }
}
