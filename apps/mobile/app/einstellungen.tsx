import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth } from '../lib/firebase';
import {
  THEME_PREFERENCE_LABELS,
  useTheme,
  useThemePreference,
  type ThemePreference,
} from '../lib/theme';
import { useStackScreenOptions } from '../lib/stackScreenOptions';

export default function EinstellungenScreen() {
  const router = useRouter();
  const theme = useTheme();
  const stackOptions = useStackScreenOptions('Einstellungen');
  const { preference, setPreference } = useThemePreference();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setEmail(user.email ?? '—');
    });
  }, [router]);

  async function logout() {
    setBusy(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } finally {
      setBusy(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Abmelden', 'Wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => void logout() },
    ]);
  }

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    rule: { width: 48, height: 1, backgroundColor: theme.rule },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    label: { color: theme.inkSoft, fontSize: 14 },
    value: { color: theme.ink, flexShrink: 1, textAlign: 'right' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', flex: 1 },
    chip: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.paper,
    },
    chipSelected: { borderColor: theme.sage, backgroundColor: theme.well },
    chipText: { color: theme.inkSoft, fontSize: 14 },
    chipTextSelected: { color: theme.ink, fontWeight: '600' },
    link: { color: theme.inkSoft, fontSize: 15 },
    logout: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.well,
    },
    logoutText: { color: theme.ink, fontSize: 16 },
    muted: { color: theme.inkSoft },
  });

  if (!email) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={stackOptions} />
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Einstellungen</Text>
          <View style={styles.rule} />

          <View style={styles.row}>
            <Text style={styles.label}>Konto</Text>
            <Text style={styles.value}>{email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Darstellung</Text>
            <View style={styles.chipRow}>
              {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => {
                const selected = preference === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => void setPreference(option)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {THEME_PREFERENCE_LABELS[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Family+</Text>
            <Text style={styles.muted}>Kommt bald</Text>
          </View>

          <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={styles.label}>Rechtliches</Text>
            <Pressable onPress={() => router.push('/impressum')}>
              <Text style={styles.link}>Impressum</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/datenschutz')}>
              <Text style={styles.link}>Datenschutz</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.logout} disabled={busy} onPress={confirmLogout}>
              <Text style={styles.logoutText}>Abmelden</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
