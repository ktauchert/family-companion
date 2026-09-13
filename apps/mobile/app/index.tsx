import { FREE_TIER_MAX_MEMBERS } from '@family-companion/shared';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Companion</Text>
      <Text style={styles.body}>Mobile-Scaffold. Shared-Paket ist verbunden.</Text>
      <Text style={styles.body}>
        Free-Tier: höchstens {FREE_TIER_MAX_MEMBERS} Mitglieder.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F6F3EE',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1D1A16',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5C564C',
    marginBottom: 8,
  },
});
