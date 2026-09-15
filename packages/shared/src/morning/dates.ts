import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../calendar/display';

export function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDateFromIso(iso: string): string {
  return localDateString(new Date(iso));
}

export function addDaysToDateString(date: string, days: number): string {
  const base = new Date(`${date}T12:00:00`);
  base.setDate(base.getDate() + days);
  return localDateString(base);
}

export function addLocalCalendarDaysToIso(iso: string, days: number): string {
  const local = toDatetimeLocalValue(iso);
  if (!local) {
    return iso;
  }
  const nextDate = addDaysToDateString(local.slice(0, 10), days);
  const timePart = local.slice(11);
  return fromDatetimeLocalValue(`${nextDate}T${timePart}`);
}
