import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export default function PlaceholderScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.page, { backgroundColor: theme.paper }]}>
      <View style={[styles.card, { backgroundColor: theme.sheet }]}>
        <Text style={[styles.title, { color: theme.ink }]}>Listen</Text>
        <View style={[styles.rule, { backgroundColor: theme.rule }]} />
        <Text style={{ color: theme.inkSoft }}>Kommt in Phase 2.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24 },
  card: { borderRadius: 20, padding: 22, gap: 12 },
  title: { fontSize: 28, fontFamily: 'Georgia' },
  rule: { width: 48, height: 1 },
});
