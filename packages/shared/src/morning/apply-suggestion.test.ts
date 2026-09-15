import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEvent, TodoItem } from '../types';
import {
  applyPostponeToEvent,
  applyPostponeToTodo,
  applyReassignToEvent,
  applyReassignToTodo,
  applySuggestionToEvent,
  applySuggestionToTodo,
} from './apply-suggestion';
import type { PrioritizationSuggestion } from './prioritize';

function eventOf(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt_1',
    householdId: 'hh_1',
    createdBy: 'user_julian',
    title: 'Elternabend',
    startsAt: '2026-09-15T16:00:00.000Z',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    completions: [],
    ...overrides,
  };
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

describe('applyPostponeToEvent', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'Europe/Berlin');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shifts by one local calendar day for a typical afternoon slot', () => {
    const event = eventOf({ startsAt: '2026-09-15T16:00:00.000Z' });
    const result = applyPostponeToEvent(event, '2026-09-15');

    expect(result.startsAt).toBe('2026-09-16T16:00:00.000Z');
  });

  it('shifts by one local calendar day near midnight without mixing UTC time parts', () => {
    const event = eventOf({ startsAt: '2026-09-15T22:30:00.000Z' });
    const result = applyPostponeToEvent(event, '2026-09-16');

    expect(result.startsAt).toBe('2026-09-16T22:30:00.000Z');
  });

  it('shifts endsAt by one local calendar day when present', () => {
    const event = eventOf({
      startsAt: '2026-09-15T16:00:00.000Z',
      endsAt: '2026-09-15T18:00:00.000Z',
    });
    const result = applyPostponeToEvent(event, '2026-09-15');

    expect(result.endsAt).toBe('2026-09-16T18:00:00.000Z');
  });
});

describe('applyPostponeToTodo', () => {
  it('sets the suggested due date', () => {
    const todo = todoOf({ dueDate: '2026-09-15' });
    const result = applyPostponeToTodo(todo, '2026-09-16');

    expect(result.dueDate).toBe('2026-09-16');
  });
});

describe('applyReassignToEvent', () => {
  it('swaps the replaced member and keeps other assignees', () => {
    const event = eventOf({ assignedTo: ['user_julian', 'user_other'] });
    const result = applyReassignToEvent(event, 'user_sophie', 'user_julian');

    expect(result.assignedTo).toEqual(['user_sophie', 'user_other']);
  });

  it('dedupes when the replacement is already assigned', () => {
    const event = eventOf({ assignedTo: ['user_julian', 'user_sophie'] });
    const result = applyReassignToEvent(event, 'user_sophie', 'user_julian');

    expect(result.assignedTo).toEqual(['user_sophie']);
  });

  it('assigns a single member when the list was empty', () => {
    const event = eventOf({ assignedTo: [] });
    const result = applyReassignToEvent(event, 'user_sophie');

    expect(result.assignedTo).toEqual(['user_sophie']);
  });
});

describe('applyReassignToTodo', () => {
  it('swaps the replaced member and keeps other assignees', () => {
    const todo = todoOf({ assignedTo: ['user_julian'] });
    const result = applyReassignToTodo(todo, 'user_sophie', 'user_julian');

    expect(result.assignedTo).toEqual(['user_sophie']);
  });
});

describe('applySuggestionToEvent', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'Europe/Berlin');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('applies postpone suggestions', () => {
    const event = eventOf({ startsAt: '2026-09-15T22:30:00.000Z' });
    const suggestion: PrioritizationSuggestion = {
      id: 'postpone_event_evt_1',
      type: 'postpone',
      targetKind: 'event',
      targetId: 'evt_1',
      message: 'Verschieben?',
    };

    const result = applySuggestionToEvent(event, suggestion, '2026-09-16');

    expect(result.startsAt).toBe('2026-09-16T22:30:00.000Z');
  });

  it('applies reassign suggestions', () => {
    const event = eventOf({ assignedTo: ['user_julian'] });
    const suggestion: PrioritizationSuggestion = {
      id: 'reassign_event_evt_1',
      type: 'reassign',
      targetKind: 'event',
      targetId: 'evt_1',
      message: 'Übernehmen?',
      suggestedAssignee: 'user_sophie',
      replacedAssignee: 'user_julian',
    };

    const result = applySuggestionToEvent(event, suggestion, '2026-09-16');

    expect(result.assignedTo).toEqual(['user_sophie']);
  });
});

describe('applySuggestionToTodo', () => {
  it('applies postpone suggestions with suggested due date', () => {
    const todo = todoOf({ dueDate: '2026-09-15' });
    const suggestion: PrioritizationSuggestion = {
      id: 'postpone_todo_todo_1',
      type: 'postpone',
      targetKind: 'todo',
      targetId: 'todo_1',
      message: 'Verschieben?',
      suggestedDueDate: '2026-09-16',
    };

    const result = applySuggestionToTodo(todo, suggestion);

    expect(result.dueDate).toBe('2026-09-16');
  });
});
