import type { CalendarEvent, Household } from '@family-companion/shared';
import {
  eventsForDay,
  eventsInWeek,
  formatDayHeading,
  isCalendarEventDoneForUser,
  isToday,
  type WeekRange,
} from '@family-companion/shared';
import { EventCard } from '../cards/EventCard';

export function CalendarWeekView({
  week,
  events,
  household,
  actorId,
  onSelectEvent,
}: {
  week: WeekRange;
  events: CalendarEvent[];
  household: Household;
  actorId: string;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const weekEvents = eventsInWeek(events, week.startDate, week.endDate);
  const hasAny = weekEvents.length > 0;

  if (!hasAny) {
    return <p className="muted">Keine Termine in dieser Woche.</p>;
  }

  return (
    <div className="week-view">
      {week.days.map((day) => {
        const { upcoming, past } = eventsForDay(weekEvents, day);
        if (upcoming.length === 0 && past.length === 0) {
          return null;
        }
        return (
          <section
            key={day}
            className={`week-day${isToday(day) ? ' week-day--today' : ''}`}
            aria-label={formatDayHeading(day)}
          >
            <h3 className="week-day-heading">{formatDayHeading(day)}</h3>
            <div className="item-card-stack">
              {upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  household={household}
                  actorId={actorId}
                  done={isCalendarEventDoneForUser(event, actorId)}
                  onPress={() => onSelectEvent(event)}
                />
              ))}
              {past.length > 0 ? (
                <>
                  <p className="muted small week-past-label">Vergangen</p>
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      household={household}
                      actorId={actorId}
                      done={isCalendarEventDoneForUser(event, actorId)}
                      past
                      onPress={() => onSelectEvent(event)}
                    />
                  ))}
                </>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
