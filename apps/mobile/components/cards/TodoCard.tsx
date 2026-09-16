import type { Household, TodoItem } from '@family-companion/shared';
import { todoCardPills } from '@family-companion/shared';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { DayPlanKindIconGlyph } from '../nav-icons';
import { useTheme } from '../../lib/theme';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { ItemCardPills } from './ItemCardPills';

export function TodoCard({
  todo,
  household,
  actorId,
  done = false,
  toggling = false,
  onPress,
  onToggleDone,
}: {
  todo: TodoItem;
  household: Household;
  actorId: string;
  done?: boolean;
  toggling?: boolean;
  onPress?: () => void;
  onToggleDone?: () => void;
}) {
  const theme = useTheme();
  const pills = todoCardPills(todo, { household, actorId });

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
    toggle: { justifyContent: 'center', paddingLeft: 4 },
  });

  const content = (
    <>
      <View style={styles.icon}>
        <DayPlanKindIconGlyph icon="todo" size={22} color={theme.inkSoft} />
      </View>
      <View style={styles.body}>
        {done ? <Text style={styles.status}>Erledigt</Text> : null}
        <Text style={styles.title}>{todo.title}</Text>
        <ItemCardPills pills={pills} />
        <EnergyHintBadge band={todo.energyHint ?? 'medium'} />
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
      {onToggleDone ? (
        <View style={styles.toggle}>
          <Switch
            value={done}
            disabled={toggling}
            onValueChange={() => onToggleDone()}
            accessibilityLabel={`${todo.title} erledigt`}
          />
        </View>
      ) : null}
    </View>
  );
}
