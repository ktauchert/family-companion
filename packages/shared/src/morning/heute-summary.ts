import { isCalendarEventDoneForUser } from '../calendar/completion';
import { formatCalendarEventRange } from '../calendar/display';
import { NAV_ICON_TO_MOBILE_TAB, NAV_ICON_TO_WEB_PATH, type NavIcon } from '../display/icons';
import { isTodoDoneForUser } from '../todos/completion';
import type { CalendarEvent, Household, ShoppingItem, TodoItem } from '../types';
import { localDateFromIso } from './dates';

export type HeuteAreaSummary = {
  area: NavIcon;
  title: string;
  line: string;
  webPath: string;
  mobilePath: string;
};

function isEventToday(event: CalendarEvent, date: string): boolean {
  return localDateFromIso(event.startsAt) === date;
}

function isTodoRelevantToday(todo: TodoItem, date: string): boolean {
  if (!todo.dueDate) {
    return true;
  }
  return todo.dueDate <= date;
}

function summarizeCalendar(input: {
  actorId: string;
  date: string;
  events: CalendarEvent[];
}): Pick<HeuteAreaSummary, 'line'> {
  const openToday = input.events
    .filter(
      (event) =>
        isEventToday(event, input.date) && !isCalendarEventDoneForUser(event, input.actorId),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  if (openToday.length === 0) {
    return { line: 'Keine Termine heute' };
  }

  const next = openToday[0]!;
  return { line: `${next.title} · ${formatCalendarEventRange(next.startsAt)}` };
}

function summarizeTodos(input: {
  actorId: string;
  date: string;
  todos: TodoItem[];
}): Pick<HeuteAreaSummary, 'line'> {
  const open = input.todos.filter(
    (todo) => !isTodoDoneForUser(todo, input.actorId) && isTodoRelevantToday(todo, input.date),
  );

  if (open.length === 0) {
    return { line: 'Keine offenen Todos' };
  }

  const overdue = open.filter((todo) => todo.dueDate && todo.dueDate < input.date);
  if (overdue.length > 0) {
    return { line: `${open.length} offen · ${overdue.length} überfällig` };
  }

  return { line: `${open.length} offen` };
}

function summarizeListen(shoppingItems: ShoppingItem[]): Pick<HeuteAreaSummary, 'line'> {
  const openCount = shoppingItems.filter((item) => !item.checked).length;
  if (openCount === 0) {
    return { line: 'Nichts auf den Listen' };
  }
  return { line: `${openCount} Artikel offen` };
}

const AREA_TITLES: Record<'kalender' | 'todos' | 'listen', string> = {
  kalender: 'Kalender',
  todos: 'Todos',
  listen: 'Listen',
};

export function buildHeuteAreaSummaries(input: {
  household: Household;
  actorId: string;
  date: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  shoppingItems: ShoppingItem[];
}): Record<'kalender' | 'todos' | 'listen', HeuteAreaSummary> {
  void input.household;
  const areas = ['kalender', 'todos', 'listen'] as const;
  const lines = {
    kalender: summarizeCalendar(input),
    todos: summarizeTodos(input),
    listen: summarizeListen(input.shoppingItems),
  };

  return Object.fromEntries(
    areas.map((area) => [
      area,
      {
        area,
        title: AREA_TITLES[area],
        line: lines[area].line,
        webPath: NAV_ICON_TO_WEB_PATH[area],
        mobilePath: `/${NAV_ICON_TO_MOBILE_TAB[area]}`,
      },
    ]),
  ) as Record<'kalender' | 'todos' | 'listen', HeuteAreaSummary>;
}
