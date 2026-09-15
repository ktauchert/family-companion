import { describe, expect, it } from 'vitest';
import { startHousehold } from '../household/membership';
import type { CalendarEvent, Household } from '../types';
import {
  canCreateCalendarEvent,
  canDeleteCalendarEvent,
  canReadCalendarEvent,
  canUpdateCalendarEvent,
} from './permissions';

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

describe('canReadCalendarEvent', () => {
  const household = householdOf();

  it('allows household members to read events in their household', () => {
    expect(
      canReadCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf(),
      }),
    ).toBe(true);
  });

  it('denies non-members', () => {
    expect(
      canReadCalendarEvent({
        actorId: 'user_stranger',
        household,
        event: eventOf(),
      }),
    ).toBe(false);
  });

  it('denies reading events from another household', () => {
    expect(
      canReadCalendarEvent({
        actorId: 'user_julian',
        household,
        event: eventOf({ householdId: 'hh_other' }),
      }),
    ).toBe(false);
  });
});

describe('canCreateCalendarEvent', () => {
  const household = householdOf();

  it('allows household members to create events', () => {
    expect(canCreateCalendarEvent({ actorId: 'user_sophie', household })).toBe(true);
  });

  it('denies non-members', () => {
    expect(canCreateCalendarEvent({ actorId: 'user_stranger', household })).toBe(false);
  });
});

describe('canDeleteCalendarEvent', () => {
  const household = householdOf();

  it('lets the owner delete a foreign event', () => {
    expect(
      canDeleteCalendarEvent({
        actorId: 'user_julian',
        household,
        event: eventOf({ createdBy: 'user_sophie' }),
      }),
    ).toBe(true);
  });

  it('lets a member delete their own event', () => {
    expect(
      canDeleteCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({ createdBy: 'user_sophie' }),
      }),
    ).toBe(true);
  });

  it('denies a member deleting a foreign event', () => {
    expect(
      canDeleteCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({ createdBy: 'user_julian' }),
      }),
    ).toBe(false);
  });

  it('denies non-members', () => {
    expect(
      canDeleteCalendarEvent({
        actorId: 'user_stranger',
        household,
        event: eventOf(),
      }),
    ).toBe(false);
  });
});

describe('canUpdateCalendarEvent', () => {
  const household = householdOf();

  it('allows members to update cooperative fields', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({ createdBy: 'user_julian' }),
        patch: { title: 'Neuer Titel' },
      }),
    ).toBe(true);
  });

  it('denies non-members', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_stranger',
        household,
        event: eventOf(),
        patch: { title: 'Neuer Titel' },
      }),
    ).toBe(false);
  });

  it('denies changing immutable fields', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_julian',
        household,
        event: eventOf(),
        patch: { createdBy: 'user_julian' },
      }),
    ).toBe(false);
  });

  it('allows household completion updates for any member', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({
          completionMode: 'household',
          completions: [],
        }),
        patch: {
          completions: [{ userId: 'user_sophie', done: true, doneAt: '2026-09-20T19:00:00.000Z' }],
        },
      }),
    ).toBe(true);
  });

  it('allows per_member completion only for the actor', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({
          completionMode: 'per_member',
          completions: [
            { userId: 'user_julian', done: false },
            { userId: 'user_sophie', done: false },
          ],
        }),
        patch: {
          completions: [
            { userId: 'user_julian', done: false },
            { userId: 'user_sophie', done: true, doneAt: '2026-09-20T19:00:00.000Z' },
          ],
        },
      }),
    ).toBe(true);
  });

  it('denies per_member completion for another member', () => {
    expect(
      canUpdateCalendarEvent({
        actorId: 'user_sophie',
        household,
        event: eventOf({
          completionMode: 'per_member',
          completions: [
            { userId: 'user_julian', done: false },
            { userId: 'user_sophie', done: false },
          ],
        }),
        patch: {
          completions: [
            { userId: 'user_julian', done: true, doneAt: '2026-09-20T19:00:00.000Z' },
            { userId: 'user_sophie', done: false },
          ],
        },
      }),
    ).toBe(false);
  });
});
