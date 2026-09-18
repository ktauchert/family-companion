import { formatCalendarEventRange } from '../calendar/display';
import { formatDueDate } from '../todos/display';
import type { NavIcon } from '../display/icons';
import { DAY_PLAN_KIND_ICON_LABELS } from '../display/icons';
import type { DayPlanItem } from './prioritize';

export type DayPlanItemTarget = {
  area: NavIcon;
  webPath: string;
  mobilePath: string;
  shoppingListId?: string;
};

export type DayPlanItemMetaOptions = {
  assigneeLabel?: string;
};

/** Primary line on Heute cards — shopping uses list summary, not product names. */
export function dayPlanItemTitle(item: DayPlanItem): string {
  if (item.kind === 'shopping' && item.shoppingListId) {
    const count = item.openCount ?? 1;
    return `${item.title} · ${count} offen`;
  }
  return item.title;
}

export function dayPlanKindStamp(item: DayPlanItem): string {
  return DAY_PLAN_KIND_ICON_LABELS[item.kind];
}

export function dayPlanItemMetaLines(item: DayPlanItem, options: DayPlanItemMetaOptions = {}): string[] {
  const lines: string[] = [];
  if (item.startsAt) {
    lines.push(formatCalendarEventRange(item.startsAt));
  }
  if (item.dueDate) {
    lines.push(`Fällig ${formatDueDate(item.dueDate)}`);
  }
  if (item.kind !== 'shopping' && options.assigneeLabel) {
    lines.push(options.assigneeLabel);
  }
  return lines;
}

export function dayPlanItemTarget(item: DayPlanItem): DayPlanItemTarget {
  if (item.kind === 'event') {
    return { area: 'kalender', webPath: '/kalender', mobilePath: '/kalender' };
  }
  if (item.kind === 'todo') {
    return { area: 'todos', webPath: '/todos', mobilePath: '/todos' };
  }
  const listId = item.shoppingListId ?? '';
  const query = listId ? `?list=${encodeURIComponent(listId)}` : '';
  return {
    area: 'listen',
    webPath: `/listen${query}`,
    mobilePath: `/listen${query}`,
    shoppingListId: listId || undefined,
  };
}

/** Heute toggle: events and todos only — shopping stays tap-through to Listen. */
export function dayPlanItemToggleSupported(item: DayPlanItem): boolean {
  return item.kind === 'event' || item.kind === 'todo';
}
