import { addDaysToDateString, localDateFromIso, localDateString } from '../morning/dates';
import type { CalendarEvent } from '../types';

export type WeekRange = {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: string[];
  headerLabel: string;
};

export type DayEvents = {
  upcoming: CalendarEvent[];
  past: CalendarEvent[];
};

function dateAtLocalNoon(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function mondayOfWeek(anchorDate: string): string {
  const date = dateAtLocalNoon(anchorDate);
  const weekday = date.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDaysToDateString(anchorDate, offset);
}

export function isoWeekNumber(anchorDate: string): number {
  const date = dateAtLocalNoon(anchorDate);
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  return Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function formatWeekHeader(
  weekNumber: number,
  startDate: string,
  endDate: string,
  locale = 'de-DE',
): string {
  const start = dateAtLocalNoon(startDate);
  const end = dateAtLocalNoon(endDate);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString(locale, { month: 'short' });
  const endMonth = end.toLocaleDateString(locale, { month: 'short' });
  const year = end.getFullYear();
  if (startMonth === endMonth) {
    return `KW ${weekNumber} · ${startDay}.–${endDay}. ${startMonth} ${year}`;
  }
  return `KW ${weekNumber} · ${startDay}. ${startMonth} – ${endDay}. ${endMonth} ${year}`;
}

export function weekRange(anchorDate: string, locale = 'de-DE'): WeekRange {
  const startDate = mondayOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, index) => addDaysToDateString(startDate, index));
  const endDate = days[6]!;
  const weekNumber = isoWeekNumber(anchorDate);
  return {
    weekNumber,
    startDate,
    endDate,
    days,
    headerLabel: formatWeekHeader(weekNumber, startDate, endDate, locale),
  };
}

export function shiftWeekAnchor(anchorDate: string, weeks: number): string {
  return addDaysToDateString(anchorDate, weeks * 7);
}

export function eventInWeek(event: CalendarEvent, startDate: string, endDate: string): boolean {
  const day = localDateFromIso(event.startsAt);
  return day >= startDate && day <= endDate;
}

export function eventsInWeek(
  events: CalendarEvent[],
  startDate: string,
  endDate: string,
): CalendarEvent[] {
  return events
    .filter((event) => eventInWeek(event, startDate, endDate))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function isEventPast(event: CalendarEvent, now = new Date()): boolean {
  const endIso = event.endsAt ?? event.startsAt;
  return new Date(endIso).getTime() < now.getTime();
}

export function eventsForDay(
  events: CalendarEvent[],
  day: string,
  now = new Date(),
): DayEvents {
  const dayEvents = events
    .filter((event) => localDateFromIso(event.startsAt) === day)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return {
    upcoming: dayEvents.filter((event) => !isEventPast(event, now)),
    past: dayEvents.filter((event) => isEventPast(event, now)),
  };
}

export function formatDayHeading(day: string, locale = 'de-DE'): string {
  return dateAtLocalNoon(day).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function isToday(day: string, now = new Date()): boolean {
  return day === localDateString(now);
}
