import type { HeuteAreaSummary } from '@family-companion/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavAreaIcon } from '../nav-icons';
import { useTheme } from '../../lib/theme';

export function AreaSummaryCards({
  summaries,
  onPressSummary,
}: {
  summaries: HeuteAreaSummary[];
  onPressSummary: (summary: HeuteAreaSummary) => void;
}) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    grid: { gap: 12 },
    card: {
      gap: 8,
      padding: 16,
      borderRadius: 20,
      backgroundColor: theme.sheet,
      borderWidth: 1,
      borderColor: theme.rule,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontFamily: 'Georgia', fontSize: 17, color: theme.ink },
    line: { color: theme.inkSoft, fontSize: 14 },
  });

  return (
    <View style={styles.grid} accessibilityLabel="Bereiche">
      {summaries.map((summary) => (
        <Pressable
          key={summary.area}
          style={styles.card}
          onPress={() => onPressSummary(summary)}
          accessibilityRole="button"
        >
          <View style={styles.head}>
            <NavAreaIcon icon={summary.area} size={18} color={theme.inkSoft} />
            <Text style={styles.title}>{summary.title}</Text>
          </View>
          <Text style={styles.line}>{summary.line}</Text>
        </Pressable>
      ))}
    </View>
  );
}
