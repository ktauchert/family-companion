import { isCalendarEventDoneForUser } from '../calendar/completion';
import { isTodoDoneForUser } from '../todos/completion';
import type {
  CalendarEvent,
  CompletionMode,
  EnergyBand,
  Household,
  MorningCheckIn,
  ShoppingItem,
  TodoItem,
} from '../types';
import { addDaysToDateString, localDateFromIso } from './dates';

export type DayPlanItem = {
  kind: 'event' | 'todo' | 'shopping';
  id: string;
  title: string;
  startsAt?: string;
  dueDate?: string;
  energyHint: EnergyBand;
  assignedTo?: string[];
  entityKind?: CalendarEvent['kind'] | TodoItem['kind'];
  completionMode?: CompletionMode;
  shoppingCategory?: ShoppingItem['category'];
};

export type PrioritizationSuggestion = {
  id: string;
  type: 'postpone' | 'reassign';
  targetKind: 'event' | 'todo';
  targetId: string;
  message: string;
  suggestedAssignee?: string;
  replacedAssignee?: string;
  suggestedDueDate?: string;
};

export type PrioritizeDayInput = {
  household: Household;
  actorId: string;
  date: string;
  checkIns: MorningCheckIn[];
  events: CalendarEvent[];
  todos: TodoItem[];
  shoppingItems?: ShoppingItem[];
};

export type PrioritizeDayResult = {
  items: DayPlanItem[];
  suggestions: PrioritizationSuggestion[];
};

function effectiveEnergyHint(hint?: EnergyBand): EnergyBand {
  return hint ?? 'medium';
}

function isEventToday(event: CalendarEvent, date: string): boolean {
  return localDateFromIso(event.startsAt) === date;
}

function isTodoRelevantToday(todo: TodoItem, date: string): boolean {
  if (!todo.dueDate) {
    return true;
  }
  return todo.dueDate <= date;
}

function householdMinEnergy(checkIns: MorningCheckIn[]): number | null {
  if (checkIns.length === 0) {
    return null;
  }
  return Math.min(...checkIns.map((entry) => entry.energy));
}

function memberEnergy(checkIns: MorningCheckIn[], userId: string): number | null {
  return checkIns.find((entry) => entry.userId === userId)?.energy ?? null;
}

function energyMatches(minEnergy: number, hint: EnergyBand): boolean {
  if (minEnergy <= 2) {
    return hint === 'low' || hint === 'medium';
  }
  if (minEnergy >= 4) {
    return hint === 'medium' || hint === 'high';
  }
  return true;
}

function isPerMemberHabit(item: DayPlanItem): boolean {
  return item.entityKind === 'habit' && item.completionMode === 'per_member';
}

function isDemotedWhenHouseholdIsLow(item: DayPlanItem): boolean {
  return item.energyHint === 'high' || item.kind === 'shopping';
}

function compareNeutral(a: DayPlanItem, b: DayPlanItem): number {
  const aTime = a.startsAt ?? a.dueDate ?? '';
  const bTime = b.startsAt ?? b.dueDate ?? '';
  if (aTime && bTime && aTime !== bTime) {
    return aTime.localeCompare(bTime);
  }
  return a.title.localeCompare(b.title);
}

function buildDayItems(input: PrioritizeDayInput): DayPlanItem[] {
  const items: DayPlanItem[] = [];

  for (const event of input.events) {
    if (!isEventToday(event, input.date)) {
      continue;
    }
    if (isCalendarEventDoneForUser(event, input.actorId)) {
      continue;
    }
    items.push({
      kind: 'event',
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      energyHint: effectiveEnergyHint(event.energyHint),
      assignedTo: event.assignedTo,
      entityKind: event.kind,
      completionMode: event.completionMode,
    });
  }

  for (const todo of input.todos) {
    if (!isTodoRelevantToday(todo, input.date)) {
      continue;
    }
    if (isTodoDoneForUser(todo, input.actorId)) {
      continue;
    }
    items.push({
      kind: 'todo',
      id: todo.id,
      title: todo.title,
      dueDate: todo.dueDate,
      energyHint: effectiveEnergyHint(todo.energyHint),
      assignedTo: todo.assignedTo,
      entityKind: todo.kind,
      completionMode: todo.completionMode,
    });
  }

  for (const item of input.shoppingItems ?? []) {
    if (item.checked) {
      continue;
    }
    items.push({
      kind: 'shopping',
      id: item.id,
      title: item.name,
      energyHint: 'medium',
      shoppingCategory: item.category,
    });
  }

  return items;
}

function sortWithEnergy(items: DayPlanItem[], minEnergy: number): DayPlanItem[] {
  const timedEvents = items
    .filter((item) => item.kind === 'event' && item.startsAt)
    .sort((a, b) => (a.startsAt ?? '').localeCompare(b.startsAt ?? ''));
  const timedIds = new Set(timedEvents.map((item) => item.id));

  const habits = items.filter(
    (item) =>
      !timedIds.has(item.id) &&
      isPerMemberHabit(item) &&
      item.energyHint !== 'high' &&
      energyMatches(minEnergy, item.energyHint),
  );
  const energyMatched = items.filter(
    (item) =>
      !timedIds.has(item.id) &&
      !habits.some((habit) => habit.id === item.id) &&
      energyMatches(minEnergy, item.energyHint),
  );
  const rest = items.filter(
    (item) =>
      !timedIds.has(item.id) &&
      !habits.some((habit) => habit.id === item.id) &&
      !energyMatched.some((match) => match.id === item.id),
  );

  rest.sort(compareNeutral);
  energyMatched.sort(compareNeutral);

  return [...timedEvents, ...habits, ...energyMatched, ...rest];
}

function buildPostponeSuggestions(
  items: DayPlanItem[],
  date: string,
): PrioritizationSuggestion[] {
  return items
    .filter((item) => item.energyHint === 'high')
    .map((item) => ({
      id: `postpone_${item.kind}_${item.id}`,
      type: 'postpone' as const,
      targetKind: item.kind === 'event' ? 'event' : 'todo',
      targetId: item.id,
      message:
        item.kind === 'todo'
          ? `„${item.title}" wirkt energieintensiv — auf morgen verschieben?`
          : `„${item.title}" wirkt energieintensiv — nicht für heute priorisieren?`,
      suggestedDueDate: addDaysToDateString(date, 1),
    }));
}

function buildReassignSuggestions(
  input: PrioritizeDayInput,
  items: DayPlanItem[],
): PrioritizationSuggestion[] {
  const suggestions: PrioritizationSuggestion[] = [];
  const lowMembers = input.household.members.filter((userId) => {
    const energy = memberEnergy(input.checkIns, userId);
    return energy !== null && energy <= 2;
  });
  const fitMembers = input.household.members.filter((userId) => {
    const energy = memberEnergy(input.checkIns, userId);
    return energy !== null && energy >= 3;
  });

  if (lowMembers.length === 0 || fitMembers.length === 0 || lowMembers.length === input.household.members.length) {
    return suggestions;
  }

  for (const item of items) {
    if (item.kind === 'shopping') {
      continue;
    }
    const assignees = item.assignedTo ?? [];
    const lowAssignee = assignees.find((userId) => lowMembers.includes(userId));
    if (!lowAssignee) {
      continue;
    }
    const replacement = fitMembers.find((userId) => userId !== lowAssignee);
    if (!replacement) {
      continue;
    }
    suggestions.push({
      id: `reassign_${item.kind}_${item.id}`,
      type: 'reassign',
      targetKind: item.kind === 'event' ? 'event' : 'todo',
      targetId: item.id,
      message: `„${item.title}" — Partner mit mehr Energie übernimmt?`,
      suggestedAssignee: replacement,
      replacedAssignee: lowAssignee,
    });
  }

  return suggestions;
}

export function prioritizeDay(input: PrioritizeDayInput): PrioritizeDayResult {
  const items = buildDayItems(input);
  const minEnergy = householdMinEnergy(input.checkIns);

  if (minEnergy === null) {
    return {
      items: [...items].sort(compareNeutral),
      suggestions: [],
    };
  }

  let sorted = sortWithEnergy(items, minEnergy);
  const suggestions: PrioritizationSuggestion[] = [];

  if (minEnergy <= 2 && input.checkIns.every((entry) => entry.energy <= 2)) {
    const heavy = sorted.filter((item) => isDemotedWhenHouseholdIsLow(item));
    const light = sorted.filter((item) => !isDemotedWhenHouseholdIsLow(item));
    sorted = [...light, ...heavy];
    suggestions.push(...buildPostponeSuggestions(heavy.filter((item) => item.kind !== 'shopping'), input.date));
  }

  suggestions.push(...buildReassignSuggestions(input, sorted));

  return { items: sorted, suggestions };
}
