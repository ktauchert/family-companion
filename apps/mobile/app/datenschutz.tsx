import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useStackScreenOptions } from '../lib/stackScreenOptions';
import { useTheme } from '../lib/theme';

export default function DatenschutzScreen() {
  const theme = useTheme();
  const stackOptions = useStackScreenOptions('Datenschutz');
  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    muted: { color: theme.inkSoft },
    body: { color: theme.ink, fontSize: 16, lineHeight: 24 },
  });

  return (
    <>
      <Stack.Screen options={stackOptions} />
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Datenschutz</Text>
        <Text style={styles.muted}>Platzhalter — Datenschutzerklärung folgt vor dem Launch.</Text>
        <Text style={styles.body}>
          Family Companion speichert Haushaltsdaten in Firebase (Authentifizierung und Firestore).
          Eine vollständige Datenschutzerklärung mit Verantwortlichem, Zwecken, Speicherdauer und
          Betroffenenrechten wird vor dem öffentlichen Start ergänzt.
        </Text>
      </ScrollView>
    </>
  );
}
