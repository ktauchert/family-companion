import { PRO_TEASERS } from '@family-companion/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function ProTeaserCards({ onActivate }: { onActivate: () => void }) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    section: { gap: 12 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    heading: {
      fontFamily: 'Georgia',
      fontSize: 20,
      color: theme.ink,
    },
    activate: {
      color: theme.inkSoft,
      fontSize: 14,
    },
    grid: { gap: 12 },
    card: {
      borderRadius: 20,
      backgroundColor: theme.sheet,
      borderWidth: 1,
      borderColor: theme.rule,
      overflow: 'hidden',
    },
    body: { padding: 16, gap: 8 },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    title: { fontFamily: 'Georgia', fontSize: 17, color: theme.ink, flex: 1 },
    stamp: {
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: theme.clay,
    },
    rule: { width: 48, height: 1, backgroundColor: theme.rule },
    line: { color: theme.inkSoft, fontSize: 14 },
    glass: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.paper,
      opacity: 0.42,
    },
  });

  return (
    <View style={styles.section} accessibilityLabel="Family+ Vorschau">
      <View style={styles.header}>
        <Text style={styles.heading}>Family+</Text>
        <Pressable onPress={onActivate} accessibilityRole="button">
          <Text style={styles.activate}>Aktivieren</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {PRO_TEASERS.map((teaser) => (
          <View key={teaser.id} style={styles.card}>
            <View style={styles.body}>
              <View style={styles.head}>
                <Text style={styles.title}>{teaser.title}</Text>
                <Text style={styles.stamp}>Pro</Text>
              </View>
              <View style={styles.rule} />
              <Text style={styles.line}>{teaser.line}</Text>
            </View>
            <View style={styles.glass} pointerEvents="none" />
          </View>
        ))}
      </View>
    </View>
  );
}
