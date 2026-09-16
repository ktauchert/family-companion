import { describe, expect, it } from 'vitest';
import type { DayPlanItem } from './prioritize';
import {
  dayPlanItemMetaLines,
  dayPlanItemTarget,
  dayPlanItemTitle,
  dayPlanItemToggleSupported,
} from './day-plan-display';

describe('dayPlanItemTitle', () => {
  it('shows category and open count for aggregated shopping rows', () => {
    const item: DayPlanItem = {
      kind: 'shopping',
      id: 'shopping_supermarket',
      title: 'Supermarkt',
      energyHint: 'medium',
      shoppingCategory: 'supermarket',
      openCount: 3,
    };
    expect(dayPlanItemTitle(item)).toBe('Supermarkt · 3 offen');
  });

  it('keeps entity title for events and todos', () => {
    expect(
      dayPlanItemTitle({
        kind: 'todo',
        id: 'todo_1',
        title: 'Post abholen',
        energyHint: 'low',
      }),
    ).toBe('Post abholen');
  });
});

describe('dayPlanItemTarget', () => {
  it('routes shopping aggregates to listen with category filter', () => {
    const target = dayPlanItemTarget({
      kind: 'shopping',
      id: 'shopping_supermarket',
      title: 'Supermarkt',
      energyHint: 'medium',
      shoppingCategory: 'supermarket',
      openCount: 2,
    });
    expect(target.area).toBe('listen');
    expect(target.webPath).toBe('/listen?category=supermarket');
    expect(target.mobilePath).toBe('/listen?category=supermarket');
  });
});

describe('dayPlanItemToggleSupported', () => {
  it('allows toggle for events and todos only', () => {
    expect(dayPlanItemToggleSupported({ kind: 'event', id: 'e', title: 'x', energyHint: 'low' })).toBe(
      true,
    );
    expect(
      dayPlanItemToggleSupported({
        kind: 'shopping',
        id: 's',
        title: 'x',
        energyHint: 'medium',
        shoppingCategory: 'other',
        openCount: 1,
      }),
    ).toBe(false);
  });
});

describe('dayPlanItemMetaLines', () => {
  it('omits energy line for shopping aggregates', () => {
    const lines = dayPlanItemMetaLines(
      {
        kind: 'shopping',
        id: 'shopping_supermarket',
        title: 'Supermarkt',
        energyHint: 'medium',
        shoppingCategory: 'supermarket',
        openCount: 1,
      },
      { assigneeLabel: 'Haushalt' },
    );
    expect(lines).toEqual([]);
  });
});
