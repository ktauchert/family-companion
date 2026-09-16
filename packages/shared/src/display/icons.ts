import type { DayPlanItem } from '../morning/prioritize';
import { SHOPPING_CATEGORY_LABELS } from '../shopping/display';
import type { ShoppingCategory } from '../types';

/** Shared key for app area navigation and matching icons (Web nav, Mobile tabs). */
export type NavIcon = (typeof NAV_AREA_KEYS)[number];

export const NAV_AREA_KEYS = ['heute', 'kalender', 'todos', 'listen', 'haushalt'] as const;

export const NAV_AREA_LABELS: Record<NavIcon, string> = {
  heute: 'Heute',
  kalender: 'Kalender',
  todos: 'Todos',
  listen: 'Listen',
  haushalt: 'Haushalt',
};

/** Mobile tab *Mehr* uses the haushalt icon key with a shorter label. */
export const NAV_AREA_MOBILE_TAB_LABELS: Record<NavIcon, string> = {
  ...NAV_AREA_LABELS,
  haushalt: 'Mehr',
};

export const NAV_ICON_TO_WEB_PATH: Record<NavIcon, string> = {
  heute: '/heute',
  kalender: '/kalender',
  todos: '/todos',
  listen: '/listen',
  haushalt: '/haushalt',
};

export const NAV_ICON_TO_MOBILE_TAB: Record<NavIcon, string> = {
  heute: 'heute',
  kalender: 'kalender',
  todos: 'todos',
  listen: 'listen',
  haushalt: 'mehr',
};

/** Shared key for day-plan item type icons (Heute cards, future DayPlanItemCard). */
export type DayPlanKindIcon = DayPlanItem['kind'];

export const DAY_PLAN_KIND_ICON_KEYS = ['event', 'todo', 'shopping'] as const;

export const DAY_PLAN_KIND_ICON_LABELS: Record<DayPlanKindIcon, string> = {
  event: 'Termin',
  todo: 'Todo',
  shopping: 'Einkauf',
};

/** Optional list-theme icons for aggregated shopping rows on Heute. */
export type ShoppingCategoryIcon = ShoppingCategory;

export const SHOPPING_CATEGORY_ICON_KEYS = [
  'supermarket',
  'drugstore',
  'pharmacy',
  'clothing',
  'other',
] as const satisfies readonly ShoppingCategoryIcon[];

export const SHOPPING_CATEGORY_ICON_LABELS: Record<ShoppingCategoryIcon, string> =
  SHOPPING_CATEGORY_LABELS;

export function navAreaLabel(key: NavIcon): string {
  return NAV_AREA_LABELS[key];
}

export function navAreaMobileTabLabel(key: NavIcon): string {
  return NAV_AREA_MOBILE_TAB_LABELS[key];
}

export function dayPlanKindIconKey(item: Pick<DayPlanItem, 'kind'>): DayPlanKindIcon {
  return item.kind;
}
