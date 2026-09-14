import type { Household } from '@family-companion/shared';
import {
  inviteChangeMessage,
  inviteHouseholdMessage,
  inviteToHousehold,
  messageFromStoreError,
  updateInvitedEmail,
  withdrawInvite,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';
import { useTheme } from '../lib/theme';

export default function EinladenScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      void households.householdForUser(user.uid).then((found) => {
        if (!found) {
          router.replace('/onboarding');
          return;
        }
        if (user.uid !== (found.ownerId ?? found.members[0])) {
          router.replace('/mehr');
          return;
        }
        setHousehold(found);
      });
    });
  }, [router]);

  async function persist(next: Household) {
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(next);
      setHousehold(next);
      setEmail('');
      setEditing(null);
    } catch (err) {
      console.error('[invite save]', err);
      setError(messageFromStoreError(err, 'Einladung konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    if (!household || !uid) {
      return;
    }
    const result = inviteToHousehold(household, { actorId: uid, email });
    if (!result.ok) {
      setError(inviteHouseholdMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  async function remove(invited: string) {
    if (!household || !uid) {
      return;
    }
    const result = withdrawInvite(household, { actorId: uid, email: invited });
    if (!result.ok) {
      setError(inviteChangeMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  async function saveEdit(fromEmail: string) {
    if (!household || !uid) {
      return;
    }
    const result = updateInvitedEmail(household, {
      actorId: uid,
      fromEmail,
      toEmail: editValue,
    });
    if (!result.ok) {
      setError(inviteChangeMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.paper,
    },
    content: {
      padding: 24,
      gap: 12,
    },
    card: {
      backgroundColor: theme.sheet,
      borderRadius: 20,
      padding: 22,
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Georgia',
      color: theme.ink,
    },
    rule: {
      width: 48,
      height: 1,
      backgroundColor: theme.rule,
    },
    muted: {
      color: theme.inkSoft,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      padding: 12,
      color: theme.ink,
      backgroundColor: theme.paper,
    },
    btn: {
      backgroundColor: theme.sage,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ghost: {
      backgroundColor: theme.well,
    },
    btnText: {
      color: theme.paper,
    },
    ghostText: {
      color: theme.ink,
    },
    err: {
      color: theme.rust,
    },
    link: {
      color: theme.inkSoft,
      fontSize: 15,
    },
    row: {
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
  });

  if (!household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  const invitePin = household.invitePin ?? '';
  const invitedEmails = household.invitedEmails ?? [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Einladungen</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>PIN: {invitePin || '—'}</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {invitedEmails.length === 0 ? (
          <Text style={styles.muted}>Noch niemand eingeladen.</Text>
        ) : (
          invitedEmails.map((invited) => (
            <View key={invited} style={styles.row}>
              {editing === invited ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editValue}
                    editable={!busy}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEditValue}
                  />
                  <Pressable style={styles.btn} onPress={() => void saveEdit(invited)} disabled={busy}>
                    <Text style={styles.btnText}>Speichern</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.ghost]}
                    onPress={() => setEditing(null)}
                    disabled={busy}
                  >
                    <Text style={[styles.btnText, styles.ghostText]}>Abbrechen</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.muted}>
                    {invited} · PIN {invitePin}
                  </Text>
                  <Pressable
                    style={[styles.btn, styles.ghost]}
                    disabled={busy}
                    onPress={() => {
                      setEditing(invited);
                      setEditValue(invited);
                    }}
                  >
                    <Text style={[styles.btnText, styles.ghostText]}>Ändern</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.ghost]}
                    disabled={busy}
                    onPress={() => void remove(invited)}
                  >
                    <Text style={[styles.btnText, styles.ghostText]}>Entfernen</Text>
                  </Pressable>
                </>
              )}
            </View>
          ))
        )}
        <TextInput
          style={styles.input}
          placeholder="E-Mail einladen"
          placeholderTextColor={theme.inkFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!busy}
          value={email}
          onChangeText={setEmail}
        />
        <Pressable style={styles.btn} onPress={() => void add()} disabled={busy}>
          <Text style={styles.btnText}>{busy ? 'Bitte warten…' : 'Auf die Liste setzen'}</Text>
        </Pressable>
        <Link href="/mehr" style={styles.link}>
          Zurück zum Haushalt
        </Link>
      </View>
    </ScrollView>
  );
}
