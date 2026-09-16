import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../types';
import {
  eventInWeek,
  eventsForDay,
  formatWeekHeader,
  isoWeekNumber,
  mondayOfWeek,
  shiftWeekAnchor,
  weekRange,
} from './week-range';

describe('weekRange', () => {
  it('returns Monday-based week for a mid-week anchor', () => {
    expect(weekRange('2026-09-16')).toEqual({
      weekNumber: 38,
      startDate: '2026-09-14',
      endDate: '2026-09-20',
      days: [
        '2026-09-14',
        '2026-09-15',
        '2026-09-16',
        '2026-09-17',
        '2026-09-18',
        '2026-09-19',
        '2026-09-20',
      ],
      headerLabel: 'KW 38 · 14.–20. Sep 2026',
    });
  });

  it('shifts the anchor by whole weeks', () => {
    expect(shiftWeekAnchor('2026-09-16', 1)).toBe('2026-09-23');
    expect(shiftWeekAnchor('2026-09-16', -1)).toBe('2026-09-09');
  });
});

describe('isoWeekNumber', () => {
  it('uses ISO week numbering with Monday start', () => {
    expect(isoWeekNumber('2026-09-14')).toBe(38);
    expect(isoWeekNumber('2026-01-01')).toBe(1);
  });
});

describe('mondayOfWeek', () => {
  it('steps back from Sunday to Monday', () => {
    expect(mondayOfWeek('2026-09-20')).toBe('2026-09-14');
  });
});

describe('formatWeekHeader', () => {
  it('formats a German week label', () => {
    expect(formatWeekHeader(38, '2026-09-14', '2026-09-20')).toBe('KW 38 · 14.–20. Sep 2026');
  });
});

describe('eventInWeek', () => {
  const event: CalendarEvent = {
    id: 'ev_1',
    householdId: 'hh_1',
    title: 'Test',
    startsAt: '2026-09-16T10:00:00.000Z',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    energyHint: 'medium',
    completions: [],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z',
  };

  it('matches events whose local start falls in the week', () => {
    expect(eventInWeek(event, '2026-09-14', '2026-09-20')).toBe(true);
    expect(eventInWeek(event, '2026-09-21', '2026-09-27')).toBe(false);
  });
});

describe('eventsForDay', () => {
  const mk = (id: string, startsAt: string, endsAt?: string): CalendarEvent => ({
    id,
    householdId: 'hh_1',
    title: id,
    startsAt,
    endsAt,
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    energyHint: 'medium',
    completions: [],
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z',
  });

  it('splits same-day events into upcoming and past buckets', () => {
    const now = new Date('2026-09-16T15:00:00.000Z');
    const result = eventsForDay(
      [
        mk('past', '2026-09-16T08:00:00.000Z', '2026-09-16T09:00:00.000Z'),
        mk('upcoming', '2026-09-16T18:00:00.000Z'),
      ],
      '2026-09-16',
      now,
    );
    expect(result.upcoming.map((entry) => entry.id)).toEqual(['upcoming']);
    expect(result.past.map((entry) => entry.id)).toEqual(['past']);
  });
});
