import type { DayPlanItem, Household } from '@family-companion/shared';
import {
  calendarAssigneeLabel,
  dayPlanItemMetaLines,
  dayPlanItemTitle,
  dayPlanItemToggleSupported,
  dayPlanKindStamp,
  parseDefaultShoppingListCategory,
} from '@family-companion/shared';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { DayPlanKindIconGlyph, ShoppingCategoryIconGlyph } from '../nav-icons';
import { useTheme } from '../../lib/theme';
import { EnergyHintBadge } from './EnergyHintBadge';

export function DayPlanItemCard({
  item,
  household,
  done = false,
  toggling = false,
  onPress,
  onToggleDone,
}: {
  item: DayPlanItem;
  household: Household;
  done?: boolean;
  toggling?: boolean;
  onPress: () => void;
  onToggleDone?: () => void;
}) {
  const theme = useTheme();
  const title = dayPlanItemTitle(item);
  const metaLines = dayPlanItemMetaLines(item, {
    assigneeLabel:
      item.kind !== 'shopping' && item.assignedTo && item.assignedTo.length > 0
        ? calendarAssigneeLabel(household, item.assignedTo)
        : undefined,
  });
  const canToggle = dayPlanItemToggleSupported(item) && onToggleDone;
  const shoppingCategory =
    item.kind === 'shopping' && item.shoppingListId
      ? parseDefaultShoppingListCategory(item.shoppingListId, household.id)
      : undefined;

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
    link: { flex: 1, flexDirection: 'row', gap: 12, minWidth: 0 },
    icon: { paddingTop: 2 },
    body: { flex: 1, gap: 4, minWidth: 0 },
    title: {
      fontSize: 18,
      fontFamily: 'Georgia',
      color: done ? theme.inkFaint : theme.ink,
      textDecorationLine: done ? 'line-through' : 'none',
    },
    toggle: { justifyContent: 'center', paddingLeft: 4 },
  });

  return (
    <View style={styles.card}>
      <Pressable style={styles.link} onPress={onPress} accessibilityRole="button">
        <View style={styles.icon}>
          {item.kind === 'shopping' && shoppingCategory ? (
            <ShoppingCategoryIconGlyph icon={shoppingCategory} size={22} color={theme.inkSoft} />
          ) : (
            <DayPlanKindIconGlyph icon={item.kind} size={22} color={theme.inkSoft} />
          )}
        </View>
        <View style={styles.body}>
          <Text style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.inkFaint }}>
            {dayPlanKindStamp(item)}
          </Text>
          <Text style={styles.title}>{title}</Text>
          {metaLines.map((line) => (
            <Text key={line} style={{ color: theme.inkSoft, fontSize: 14 }}>
              {line}
            </Text>
          ))}
          {item.kind !== 'shopping' ? <EnergyHintBadge band={item.energyHint} /> : null}
        </View>
      </Pressable>
      {canToggle ? (
        <View style={styles.toggle}>
          <Switch
            value={done}
            disabled={toggling}
            onValueChange={() => onToggleDone()}
            accessibilityLabel={`${title} erledigt`}
          />
        </View>
      ) : null}
    </View>
  );
}
