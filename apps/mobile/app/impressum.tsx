import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useStackScreenOptions } from '../lib/stackScreenOptions';
import { useTheme } from '../lib/theme';

export default function ImpressumScreen() {
  const theme = useTheme();
  const stackOptions = useStackScreenOptions('Impressum');
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
        <Text style={styles.title}>Impressum</Text>
        <Text style={styles.muted}>Platzhalter — rechtliche Angaben folgen vor dem Launch.</Text>
        <Text style={styles.body}>
          Verantwortlich für den Inhalt ist der Betreiber von Family Companion. Kontakt- und
          Unternehmensangaben werden hier ergänzt, sobald die finale Domain und der Anbieter
          feststehen.
        </Text>
      </ScrollView>
    </>
  );
}
