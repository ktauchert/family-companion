import type { CalendarEvent, Household, TodoItem } from '../types';
import { listOpenMandatoryHabitsForUser } from '../habits/open-mandatory';
import { localDateString } from '../morning/dates';
import { pickKaizenQuote } from './quotes';

export const KAIZEN_EVENING_HOUR = 18;

export type KaizenNudge = {
  targetKind: 'event' | 'todo';
  habitId: string;
  habitTitle: string;
  quote: string;
};

export function isKaizenEvening(now: Date, eveningHour = KAIZEN_EVENING_HOUR): boolean {
  return now.getHours() >= eveningHour;
}

export function evaluateKaizenNudge(input: {
  household: Household;
  actorId: string;
  date: string;
  now: Date;
  events: CalendarEvent[];
  todos: TodoItem[];
  kaizenNudgesEnabled: boolean;
}): KaizenNudge | null {
  if (input.household.plan !== 'pro' || !input.kaizenNudgesEnabled) {
    return null;
  }

  if (input.date !== localDateString(input.now)) {
    return null;
  }

  if (!isKaizenEvening(input.now)) {
    return null;
  }

  const open = listOpenMandatoryHabitsForUser({
    actorId: input.actorId,
    date: input.date,
    events: input.events,
    todos: input.todos,
  });

  const first = open[0];
  if (!first) {
    return null;
  }

  return {
    targetKind: first.targetKind,
    habitId: first.id,
    habitTitle: first.title,
    quote: pickKaizenQuote(`${input.date}:${input.actorId}:${first.id}`),
  };
}
