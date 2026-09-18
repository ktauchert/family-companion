import type { KaizenNudge } from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function KaizenNudgeCard({ nudge }: { nudge: KaizenNudge }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.paper, borderColor: theme.rule }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>Kaizen</Text>
        <Text style={[styles.stamp, { color: theme.inkSoft, borderColor: theme.rule }]}>Abend</Text>
      </View>
      <Text style={{ color: theme.ink }}>
        <Text style={{ fontWeight: '600' }}>{nudge.habitTitle}</Text> ist heute noch offen.
      </Text>
      <Text style={{ color: theme.inkSoft, marginTop: 8 }}>{nudge.quote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  stamp: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
