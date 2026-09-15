import type { CalendarEvent, TodoItem } from '../types';
import { addLocalCalendarDaysToIso } from './dates';
import type { PrioritizationSuggestion } from './prioritize';

export function swapAssignee(
  assignedTo: string[] | undefined,
  fromUserId: string | undefined,
  toUserId: string,
): string[] {
  if (fromUserId && fromUserId === toUserId) {
    return assignedTo ?? [];
  }

  const assignees = assignedTo ?? [];

  if (fromUserId) {
    if (!assignees.includes(fromUserId)) {
      return assignees.includes(toUserId) ? assignees : [...assignees, toUserId];
    }
    return [...new Set(assignees.map((id) => (id === fromUserId ? toUserId : id)))];
  }

  if (assignees.length === 0) {
    return [toUserId];
  }

  if (assignees.length === 1) {
    return [toUserId];
  }

  return assignees.includes(toUserId) ? assignees : [...assignees, toUserId];
}

export function applyPostponeToEvent(event: CalendarEvent, _date: string): CalendarEvent {
  return {
    ...event,
    startsAt: addLocalCalendarDaysToIso(event.startsAt, 1),
    endsAt: event.endsAt ? addLocalCalendarDaysToIso(event.endsAt, 1) : undefined,
  };
}

export function applyPostponeToTodo(todo: TodoItem, suggestedDueDate: string): TodoItem {
  return { ...todo, dueDate: suggestedDueDate };
}

export function applyReassignToEvent(
  event: CalendarEvent,
  assigneeId: string,
  replacedAssignee?: string,
): CalendarEvent {
  return {
    ...event,
    assignedTo: swapAssignee(event.assignedTo, replacedAssignee, assigneeId),
  };
}

export function applyReassignToTodo(
  todo: TodoItem,
  assigneeId: string,
  replacedAssignee?: string,
): TodoItem {
  return {
    ...todo,
    assignedTo: swapAssignee(todo.assignedTo, replacedAssignee, assigneeId),
  };
}

export function applySuggestionToEvent(
  event: CalendarEvent,
  suggestion: PrioritizationSuggestion,
  fallbackDate: string,
): CalendarEvent {
  if (suggestion.type === 'postpone') {
    return applyPostponeToEvent(event, fallbackDate);
  }
  if (suggestion.type === 'reassign' && suggestion.suggestedAssignee) {
    return applyReassignToEvent(
      event,
      suggestion.suggestedAssignee,
      suggestion.replacedAssignee,
    );
  }
  return event;
}

export function applySuggestionToTodo(
  todo: TodoItem,
  suggestion: PrioritizationSuggestion,
): TodoItem {
  if (suggestion.type === 'postpone' && suggestion.suggestedDueDate) {
    return applyPostponeToTodo(todo, suggestion.suggestedDueDate);
  }
  if (suggestion.type === 'reassign' && suggestion.suggestedAssignee) {
    return applyReassignToTodo(todo, suggestion.suggestedAssignee, suggestion.replacedAssignee);
  }
  return todo;
}
