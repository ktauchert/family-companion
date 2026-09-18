'use client';

import type {
  CalendarEvent,
  DayPlanItem,
  Household,
  OpenMandatoryHabit,
  TodoItem,
} from '@family-companion/shared';
import { DayPlanItemCard } from './DayPlanItemCard';

function mandatoryHabitToDayPlanItem(
  habit: OpenMandatoryHabit,
  events: CalendarEvent[],
  todos: TodoItem[],
): DayPlanItem | null {
  if (habit.targetKind === 'event') {
    const event = events.find((entry) => entry.id === habit.id);
    if (!event) {
      return null;
    }
    return {
      kind: 'event',
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      energyHint: event.energyHint ?? 'medium',
      assignedTo: event.assignedTo,
      entityKind: event.kind,
      completionMode: event.completionMode,
    };
  }

  const todo = todos.find((entry) => entry.id === habit.id);
  if (!todo) {
    return null;
  }
  return {
    kind: 'todo',
    id: todo.id,
    title: todo.title,
    dueDate: todo.dueDate,
    energyHint: todo.energyHint ?? 'medium',
    assignedTo: todo.assignedTo,
    entityKind: todo.kind,
    completionMode: todo.completionMode,
  };
}

export function MandatoryHabitsSection({
  habits,
  events,
  todos,
  household,
  togglingId,
  isDone,
  onToggleDone,
}: {
  habits: OpenMandatoryHabit[];
  events: CalendarEvent[];
  todos: TodoItem[];
  household: Household;
  togglingId: string | null;
  isDone: (habit: OpenMandatoryHabit) => boolean;
  onToggleDone: (habit: OpenMandatoryHabit) => void;
}) {
  if (habits.length === 0) {
    return null;
  }

  return (
    <section className="stack wide mandatory-habits-section" aria-label="Pflicht-Habits">
      <div className="row-between">
        <h2>Pflicht-Habits</h2>
        <span className="stamp pro-teaser-stamp">Pro</span>
      </div>
      <hr className="rule" />
      <div className="day-plan-stack">
        {habits.map((habit) => {
          const item = mandatoryHabitToDayPlanItem(habit, events, todos);
          if (!item) {
            return null;
          }
          return (
            <DayPlanItemCard
              key={`${habit.targetKind}_${habit.id}`}
              item={item}
              household={household}
              done={isDone(habit)}
              toggling={togglingId === habit.id}
              onToggleDone={() => onToggleDone(habit)}
            />
          );
        })}
      </div>
    </section>
  );
}
