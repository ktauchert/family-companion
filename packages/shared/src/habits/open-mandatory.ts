import { isCalendarEventDoneForUser } from '../calendar/completion';
import { localDateFromIso } from '../morning/dates';
import { isTodoDoneForUser } from '../todos/completion';
import type { CalendarEvent, CompletionMode, TodoItem } from '../types';

export type OpenMandatoryHabit = {
  targetKind: 'event' | 'todo';
  id: string;
  title: string;
  completionMode: CompletionMode;
};

export function isMandatoryDailyHabitEntity(
  entity: Pick<CalendarEvent | TodoItem, 'mandatoryDaily' | 'kind' | 'recurrence'>,
): boolean {
  return entity.mandatoryDaily === true && entity.kind === 'habit' && entity.recurrence === 'daily';
}

function isMandatoryDailyHabit(
  entity: Pick<CalendarEvent | TodoItem, 'mandatoryDaily' | 'kind' | 'recurrence'>,
): boolean {
  return isMandatoryDailyHabitEntity(entity);
}

function isCalendarMandatoryToday(event: CalendarEvent, date: string): boolean {
  if (!isMandatoryDailyHabit(event)) {
    return false;
  }
  return event.recurrence === 'daily' || localDateFromIso(event.startsAt) === date;
}

function isTodoMandatoryToday(todo: TodoItem, date: string): boolean {
  if (!isMandatoryDailyHabit(todo)) {
    return false;
  }
  if (!todo.dueDate) {
    return true;
  }
  return todo.dueDate <= date;
}

export function listOpenMandatoryHabitsForUser(input: {
  actorId: string;
  date: string;
  events: CalendarEvent[];
  todos: TodoItem[];
}): OpenMandatoryHabit[] {
  const open: OpenMandatoryHabit[] = [];

  for (const event of input.events) {
    if (!isCalendarMandatoryToday(event, input.date)) {
      continue;
    }
    if (isCalendarEventDoneForUser(event, input.actorId)) {
      continue;
    }
    open.push({
      targetKind: 'event',
      id: event.id,
      title: event.title,
      completionMode: event.completionMode,
    });
  }

  for (const todo of input.todos) {
    if (!isTodoMandatoryToday(todo, input.date)) {
      continue;
    }
    if (isTodoDoneForUser(todo, input.actorId)) {
      continue;
    }
    open.push({
      targetKind: 'todo',
      id: todo.id,
      title: todo.title,
      completionMode: todo.completionMode,
    });
  }

  return open;
}
