import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household, TodoItem } from '../types';
import { eventCardPills, todoCardPills } from './item-card';

function householdOf(): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    members: ['user_julian', 'user_sophie'],
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    },
  };
}

describe('eventCardPills', () => {
  it('builds pills for time, kind, recurrence and assignee count', () => {
    const event: CalendarEvent = {
      id: 'ev_1',
      householdId: 'hh_1',
      createdBy: 'user_julian',
      title: 'Elternabend',
      startsAt: '2026-09-16T18:00:00.000Z',
      assignedTo: ['user_julian'],
      completionMode: 'household',
      recurrence: 'weekly',
      kind: 'event',
      energyHint: 'medium',
      completions: [],
    };

    const pills = eventCardPills(event, { household: householdOf(), actorId: 'user_julian' });

    expect(pills.find((pill) => pill.key === 'time')?.label).toContain('16.');
    expect(pills.find((pill) => pill.key === 'kind')).toMatchObject({
      label: 'Termin',
      shape: 'pill',
    });
    expect(pills.find((pill) => pill.key === 'recurrence')).toMatchObject({ label: 'Wöchentlich' });
    expect(pills.find((pill) => pill.key === 'assignee')).toMatchObject({
      label: '1 Person',
      emphasis: true,
    });
  });

  it('uses tag shape for calendar habits', () => {
    const event: CalendarEvent = {
      id: 'ev_h',
      householdId: 'hh_1',
      createdBy: 'user_julian',
      title: 'Fitness',
      startsAt: '2026-09-16T18:00:00.000Z',
      assignedTo: [],
      completionMode: 'household',
      recurrence: 'daily',
      kind: 'habit',
      energyHint: 'high',
      completions: [],
    };

    expect(eventCardPills(event, { household: householdOf(), actorId: 'user_julian' }).find((pill) => pill.key === 'kind')).toMatchObject({
      label: 'Habit',
      shape: 'tag',
    });
  });
});

describe('todoCardPills', () => {
  it('builds pills for due date, kind and assignee count', () => {
    const todo: TodoItem = {
      id: 'todo_1',
      householdId: 'hh_1',
      createdBy: 'user_sophie',
      title: 'Post abholen',
      status: 'todo',
      dueDate: '2026-09-17',
      assignedTo: ['user_sophie'],
      completionMode: 'household',
      recurrence: 'none',
      kind: 'task',
      energyHint: 'low',
      completions: [],
    };

    const pills = todoCardPills(todo, { household: householdOf(), actorId: 'user_julian' });

    expect(pills.find((pill) => pill.key === 'due')?.label).toContain('17.');
    expect(pills.find((pill) => pill.key === 'kind')).toMatchObject({
      label: 'Aufgabe',
      shape: 'soft',
    });
    expect(pills.find((pill) => pill.key === 'assignee')).toMatchObject({
      label: '1 Person',
      emphasis: false,
    });
  });
});
