import type { Household, MorningCheckIn } from '@family-companion/shared';
import { formatMorningCheckInChip } from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function CheckInChip({
  checkIns,
  household,
}: {
  checkIns: MorningCheckIn[];
  household: Household;
}) {
  const theme = useTheme();
  const label = formatMorningCheckInChip(checkIns, household);
  if (!label) {
    return null;
  }

  const styles = StyleSheet.create({
    chip: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.well,
    },
    text: { color: theme.inkSoft, fontSize: 14 },
  });

  return (
    <View style={styles.chip} accessibilityLabel={label}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
