import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household } from '../types';
import { prepareCreateCalendarEvent, prepareUpdateCalendarEvent } from './event';

function householdOf(overrides: Partial<Household> = {}): Household {
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
    ...overrides,
  };
}

function eventOf(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt_1',
    householdId: 'hh_1',
    createdBy: 'user_sophie',
    title: 'Elternabend',
    startsAt: '2026-09-20T18:00:00.000Z',
    completionMode: 'household',
    recurrence: 'none',
    kind: 'event',
    completions: [],
    ...overrides,
  };
}

describe('prepareCreateCalendarEvent', () => {
  const household = householdOf();

  it('creates an event with createdBy set to the actor', () => {
    const result = prepareCreateCalendarEvent({
      actorId: 'user_sophie',
      household,
      eventId: 'evt_new',
      title: ' Zahnarzt ',
      startsAt: '2026-09-21T10:00:00.000Z',
    });

    expect(result).toEqual({
      ok: true,
      event: {
        id: 'evt_new',
        householdId: 'hh_1',
        createdBy: 'user_sophie',
        title: 'Zahnarzt',
        startsAt: '2026-09-21T10:00:00.000Z',
        completionMode: 'household',
        recurrence: 'none',
        kind: 'event',
        completions: [],
      },
    });
  });

  it('rejects non-members', () => {
    expect(
      prepareCreateCalendarEvent({
        actorId: 'user_stranger',
        household,
        eventId: 'evt_new',
        title: 'Zahnarzt',
        startsAt: '2026-09-21T10:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'not_member' });
  });

  it('rejects a blank title', () => {
    expect(
      prepareCreateCalendarEvent({
        actorId: 'user_sophie',
        household,
        eventId: 'evt_new',
        title: '   ',
        startsAt: '2026-09-21T10:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'title_required' });
  });

  it('rejects endsAt before startsAt', () => {
    expect(
      prepareCreateCalendarEvent({
        actorId: 'user_sophie',
        household,
        eventId: 'evt_new',
        title: 'Zahnarzt',
        startsAt: '2026-09-21T12:00:00.000Z',
        endsAt: '2026-09-21T10:00:00.000Z',
      }),
    ).toEqual({ ok: false, reason: 'invalid_dates' });
  });

  it('rejects assignees outside the household', () => {
    expect(
      prepareCreateCalendarEvent({
        actorId: 'user_sophie',
        household,
        eventId: 'evt_new',
        title: 'Zahnarzt',
        startsAt: '2026-09-21T10:00:00.000Z',
        assignedTo: ['user_stranger'],
      }),
    ).toEqual({ ok: false, reason: 'invalid_assignee' });
  });
});

describe('prepareUpdateCalendarEvent', () => {
  const household = householdOf();

  it('updates allowed fields', () => {
    const result = prepareUpdateCalendarEvent({
      actorId: 'user_julian',
      household,
      event: eventOf(),
      patch: { title: ' Elternabend neu ' },
    });

    expect(result).toEqual({
      ok: true,
      event: eventOf({ title: 'Elternabend neu' }),
    });
  });

  it('rejects updates that are not allowed', () => {
    expect(
      prepareUpdateCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({
          completionMode: 'per_member',
          completions: [{ userId: 'user_julian', done: false }],
        }),
        patch: {
          completions: [{ userId: 'user_julian', done: true, doneAt: '2026-09-20T19:00:00.000Z' }],
        },
      }),
    ).toEqual({ ok: false, reason: 'not_allowed' });
  });
});
