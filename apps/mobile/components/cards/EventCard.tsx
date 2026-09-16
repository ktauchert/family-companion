import type { CalendarEvent, Household } from '@family-companion/shared';
import { eventCardPills } from '@family-companion/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPlanKindIconGlyph } from '../nav-icons';
import { useTheme } from '../../lib/theme';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { ItemCardPills } from './ItemCardPills';

export function EventCard({
  event,
  household,
  actorId,
  done = false,
  past = false,
  onPress,
}: {
  event: CalendarEvent;
  household: Household;
  actorId: string;
  done?: boolean;
  past?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const pills = eventCardPills(event, { household, actorId });

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 20,
      backgroundColor: theme.paper,
      opacity: past ? 0.72 : 1,
    },
    main: { flex: 1, flexDirection: 'row', gap: 12, minWidth: 0 },
    icon: { paddingTop: 2 },
    body: { flex: 1, gap: 4, minWidth: 0 },
    title: {
      fontSize: 18,
      fontFamily: 'Georgia',
      color: done ? theme.inkFaint : theme.ink,
      textDecorationLine: done ? 'line-through' : 'none',
    },
    status: { fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.inkFaint },
  });

  const content = (
    <>
      <View style={styles.icon}>
        <DayPlanKindIconGlyph icon="event" size={22} color={theme.inkSoft} />
      </View>
      <View style={styles.body}>
        {done ? <Text style={styles.status}>Erledigt</Text> : null}
        <Text style={styles.title}>{event.title}</Text>
        <ItemCardPills pills={pills} />
        <EnergyHintBadge band={event.energyHint ?? 'medium'} />
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable style={styles.main} onPress={onPress} accessibilityRole="button">
          {content}
        </Pressable>
      ) : (
        <View style={styles.main}>{content}</View>
      )}
    </View>
  );
}
