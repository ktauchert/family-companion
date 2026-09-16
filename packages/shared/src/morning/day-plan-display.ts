import { formatCalendarEventRange } from '../calendar/display';
import { SHOPPING_CATEGORY_LABELS } from '../shopping/display';
import { formatDueDate } from '../todos/display';
import type { NavIcon } from '../display/icons';
import { DAY_PLAN_KIND_ICON_LABELS } from '../display/icons';
import type { ShoppingCategory } from '../types';
import type { DayPlanItem } from './prioritize';

export type DayPlanItemTarget = {
  area: NavIcon;
  webPath: string;
  mobilePath: string;
  shoppingCategory?: ShoppingCategory;
};

export type DayPlanItemMetaOptions = {
  assigneeLabel?: string;
};

/** Primary line on Heute cards — shopping uses category summary, not product names. */
export function dayPlanItemTitle(item: DayPlanItem): string {
  if (item.kind === 'shopping' && item.shoppingCategory) {
    const label = SHOPPING_CATEGORY_LABELS[item.shoppingCategory];
    const count = item.openCount ?? 1;
    return `${label} · ${count} offen`;
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
  const category = item.shoppingCategory ?? 'other';
  const query = `?category=${category}`;
  return {
    area: 'listen',
    webPath: `/listen${query}`,
    mobilePath: `/listen${query}`,
    shoppingCategory: category,
  };
}

/** Heute toggle: events and todos only — shopping stays tap-through to Listen. */
export function dayPlanItemToggleSupported(item: DayPlanItem): boolean {
  return item.kind === 'event' || item.kind === 'todo';
}
