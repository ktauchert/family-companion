import { describe, expect, it } from 'vitest';
import type { CalendarEvent, TodoItem } from '../types';
import { listOpenMandatoryHabitsForUser } from './open-mandatory';

describe('listOpenMandatoryHabitsForUser', () => {
  const actorId = 'user_julian';

  it('returns open daily mandatory habits for today', () => {
    const events: CalendarEvent[] = [
      {
        id: 'evt_1',
        householdId: 'hh_1',
        createdBy: actorId,
        title: 'Fitness',
        startsAt: '2026-09-18T07:00:00.000Z',
        completionMode: 'per_member',
        recurrence: 'daily',
        kind: 'habit',
        mandatoryDaily: true,
        completions: [{ userId: actorId, done: false }],
      },
    ];
    const todos: TodoItem[] = [
      {
        id: 'todo_1',
        householdId: 'hh_1',
        createdBy: actorId,
        title: 'Journal',
        status: 'todo',
        completionMode: 'household',
        recurrence: 'daily',
        kind: 'habit',
        mandatoryDaily: true,
        completions: [{ userId: actorId, done: true }],
      },
    ];

    expect(
      listOpenMandatoryHabitsForUser({
        actorId,
        date: '2026-09-18',
        events,
        todos,
      }),
    ).toEqual([
      {
        targetKind: 'event',
        id: 'evt_1',
        title: 'Fitness',
        completionMode: 'per_member',
      },
    ]);
  });

  it('ignores completed mandatory habits', () => {
    const events: CalendarEvent[] = [
      {
        id: 'evt_1',
        householdId: 'hh_1',
        createdBy: actorId,
        title: 'Fitness',
        startsAt: '2026-09-18T07:00:00.000Z',
        completionMode: 'per_member',
        recurrence: 'daily',
        kind: 'habit',
        mandatoryDaily: true,
        completions: [{ userId: actorId, done: true, doneAt: '2026-09-18T08:00:00.000Z' }],
      },
    ];

    expect(
      listOpenMandatoryHabitsForUser({
        actorId,
        date: '2026-09-18',
        events,
        todos: [],
      }),
    ).toEqual([]);
  });
});
