import type { EnergyBand } from '@family-companion/shared';
import { ENERGY_HINT_VISUAL } from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function EnergyHintBadge({ band }: { band: EnergyBand }) {
  const theme = useTheme();
  const visual = ENERGY_HINT_VISUAL[band];
  const color =
    visual.token === 'sage' ? theme.sage : visual.token === 'clay' ? theme.clay : theme.rust;

  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: color },
    label: {
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: theme.inkFaint,
    },
  });

  return (
    <View style={styles.row} accessibilityLabel={visual.ariaLabel}>
      <View style={styles.dot} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={styles.label}>{visual.label}</Text>
    </View>
  );
}
