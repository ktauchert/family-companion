import type { Household, UserPreferences } from '@family-companion/shared';
import {
  defaultUserPreferences,
  isKaizenNudgesEnabled,
  messageFromStoreError,
  prepareSaveUserPreferences,
  upgradeHouseholdPlanMessage,
  upgradeHouseholdToPro,
  userPreferencesErrorMessage,
} from '@family-companion/shared';
import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';
import { userPreferences } from '../lib/userPreferences';
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
  const [uid, setUid] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setEmail(user.email ?? '—');
      setUid(user.uid);
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  useEffect(() => {
    if (!uid) {
      return;
    }
    return userPreferences.subscribeForUser(uid, setPrefs);
  }, [uid]);

  async function activateFamilyPlus() {
    if (!household || !uid) {
      return;
    }
    const result = upgradeHouseholdToPro(household, { actorId: uid });
    if (!result.ok) {
      setError(upgradeHouseholdPlanMessage(result.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(result.household);
      setHousehold(result.household);
    } catch (err) {
      console.error('[upgrade plan]', err);
      setError(messageFromStoreError(err, 'Family+ konnte nicht aktiviert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } finally {
      setBusy(false);
    }
  }

  async function setKaizenNudgesEnabled(enabled: boolean) {
    if (!uid) {
      return;
    }
    const result = prepareSaveUserPreferences({
      actorId: uid,
      preferences: {
        ...defaultUserPreferences(uid),
        ...prefs,
        userId: uid,
        kaizenNudgesEnabled: enabled,
      },
    });
    if (!result.ok) {
      setError(userPreferencesErrorMessage(result.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await userPreferences.savePreferences(result.preferences);
      setPrefs(result.preferences);
    } catch (err) {
      setError(messageFromStoreError(err, 'Einstellung konnte nicht gespeichert werden.'));
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
    activate: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.sage,
    },
    activateText: { color: theme.paper, fontSize: 15, fontWeight: '600' },
    proStamp: {
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: theme.clay,
    },
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
    err: { color: theme.rust },
    hint: { color: theme.inkSoft, fontSize: 13 },
  });

  if (!email || !household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  const isOwner = uid === (household.ownerId ?? household.members[0]);
  const isPro = household.plan === 'pro';

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
            <Text style={styles.label}>Kaizen-Nudges</Text>
            <Switch
              value={isKaizenNudgesEnabled(prefs ?? undefined)}
              disabled={busy}
              onValueChange={(value) => void setKaizenNudgesEnabled(value)}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Family+</Text>
            {isPro ? (
              <Text style={styles.proStamp}>Aktiv</Text>
            ) : isOwner ? (
              <Pressable
                style={styles.activate}
                disabled={busy}
                onPress={() => void activateFamilyPlus()}
              >
                <Text style={styles.activateText}>{busy ? 'Bitte warten…' : 'Aktivieren'}</Text>
              </Pressable>
            ) : (
              <Text style={styles.muted}>Nur der Inhaber kann aktivieren.</Text>
            )}
          </View>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {!isPro && isOwner ? (
            <Text style={styles.hint}>
              Mehr Mitglieder, KI-Tagesplan, Per-Member-Habits und Smart Shopping — ohne
              Zahlungsanbieter in dieser Phase.
            </Text>
          ) : null}

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
