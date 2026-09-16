import type { ItemCardPill } from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

function pillRadius(shape: ItemCardPill['shape']) {
  switch (shape) {
    case 'pill':
      return 999;
    case 'tag':
      return { borderTopLeftRadius: 12, borderTopRightRadius: 4, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 };
    case 'soft':
    default:
      return 12;
  }
}

export function ItemCardPills({ pills }: { pills: ItemCardPill[] }) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 2,
      backgroundColor: theme.well,
      borderWidth: 1,
      borderColor: theme.rule,
    },
    label: { fontSize: 12, color: theme.inkSoft },
    emphasis: { fontWeight: '600', color: theme.ink },
  });

  return (
    <View style={styles.row}>
      {pills.map((pill) => {
        const radius = pillRadius(pill.shape);
        return (
          <View
            key={pill.key}
            style={[styles.pill, typeof radius === 'number' ? { borderRadius: radius } : radius]}
          >
            <Text style={[styles.label, pill.emphasis ? styles.emphasis : undefined]}>{pill.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
