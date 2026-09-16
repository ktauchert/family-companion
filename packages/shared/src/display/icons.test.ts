import { describe, expect, it } from 'vitest';
import type { DayPlanItem } from '../morning/prioritize';
import type { ShoppingCategory } from '../types';
import {
  DAY_PLAN_KIND_ICON_KEYS,
  DAY_PLAN_KIND_ICON_LABELS,
  NAV_AREA_KEYS,
  NAV_AREA_LABELS,
  NAV_AREA_MOBILE_TAB_LABELS,
  NAV_ICON_TO_MOBILE_TAB,
  NAV_ICON_TO_WEB_PATH,
  SHOPPING_CATEGORY_ICON_KEYS,
  SHOPPING_CATEGORY_ICON_LABELS,
  dayPlanKindIconKey,
  navAreaLabel,
  navAreaMobileTabLabel,
} from './icons';

describe('nav area icons', () => {
  it('exports stable keys and German labels for all areas', () => {
    expect(NAV_AREA_KEYS).toEqual(['heute', 'kalender', 'todos', 'listen', 'haushalt']);
    expect(NAV_AREA_LABELS.heute).toBe('Heute');
    expect(NAV_AREA_LABELS.kalender).toBe('Kalender');
    expect(NAV_AREA_LABELS.todos).toBe('Todos');
    expect(NAV_AREA_LABELS.listen).toBe('Listen');
    expect(NAV_AREA_LABELS.haushalt).toBe('Haushalt');
  });

  it('maps haushalt to Mehr on mobile tabs while keeping Haushalt elsewhere', () => {
    expect(navAreaLabel('haushalt')).toBe('Haushalt');
    expect(navAreaMobileTabLabel('haushalt')).toBe('Mehr');
    expect(NAV_AREA_MOBILE_TAB_LABELS.haushalt).toBe('Mehr');
  });

  it('maps nav keys to web paths and mobile tab routes', () => {
    expect(NAV_ICON_TO_WEB_PATH.heute).toBe('/heute');
    expect(NAV_ICON_TO_WEB_PATH.haushalt).toBe('/haushalt');
    expect(NAV_ICON_TO_MOBILE_TAB.haushalt).toBe('mehr');
    expect(NAV_ICON_TO_MOBILE_TAB.listen).toBe('listen');
  });
});

describe('day plan kind icons', () => {
  it('exports stable keys aligned with DayPlanItem.kind', () => {
    expect(DAY_PLAN_KIND_ICON_KEYS).toEqual(['event', 'todo', 'shopping']);
    expect(DAY_PLAN_KIND_ICON_LABELS.event).toBe('Termin');
    expect(DAY_PLAN_KIND_ICON_LABELS.todo).toBe('Todo');
    expect(DAY_PLAN_KIND_ICON_LABELS.shopping).toBe('Einkauf');
  });

  it('derives icon key from day plan items', () => {
    const item: DayPlanItem = {
      kind: 'event',
      id: 'ev_1',
      title: 'Arzt',
      energyHint: 'medium',
    };
    expect(dayPlanKindIconKey(item)).toBe('event');
  });
});

describe('shopping category icons', () => {
  it('exports optional category keys with labels', () => {
    const categories: ShoppingCategory[] = [
      'supermarket',
      'drugstore',
      'pharmacy',
      'clothing',
      'other',
    ];
    expect(SHOPPING_CATEGORY_ICON_KEYS).toEqual(categories);
    expect(SHOPPING_CATEGORY_ICON_LABELS.supermarket).toBe('Supermarkt');
    expect(SHOPPING_CATEGORY_ICON_LABELS.other).toBe('Sonstiges');
  });
});
