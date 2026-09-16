import type { CalendarEvent, Household, WeekRange } from '@family-companion/shared';
import {
  eventsForDay,
  eventsInWeek,
  formatDayHeading,
  isCalendarEventDoneForUser,
  isToday,
} from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../cards/EventCard';
import { useTheme } from '../../lib/theme';

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
  const theme = useTheme();
  const weekEvents = eventsInWeek(events, week.startDate, week.endDate);
  const styles = StyleSheet.create({
    wrap: { gap: 16 },
    day: { gap: 8 },
    dayToday: {
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.well,
    },
    heading: { fontSize: 15, fontWeight: '600', color: theme.inkSoft },
    pastLabel: { fontSize: 13, color: theme.inkFaint, marginTop: 4 },
    stack: { gap: 10 },
    empty: { color: theme.inkSoft },
  });

  if (weekEvents.length === 0) {
    return <Text style={styles.empty}>Keine Termine in dieser Woche.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {week.days.map((day) => {
        const { upcoming, past } = eventsForDay(weekEvents, day);
        if (upcoming.length === 0 && past.length === 0) {
          return null;
        }
        return (
          <View key={day} style={[styles.day, isToday(day) && styles.dayToday]}>
            <Text style={styles.heading}>{formatDayHeading(day)}</Text>
            <View style={styles.stack}>
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
                  <Text style={styles.pastLabel}>Vergangen</Text>
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
            </View>
          </View>
        );
      })}
    </View>
  );
}
