import {
  householdForJoinPin,
  invitePinReasonMessage,
  joinHousehold,
  joinHouseholdMessage,
  messageFromStoreError,
  newInvitePin,
  parseEmailAddress,
  parseInvitePin,
  startHousehold,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';
import { useTheme } from '../lib/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('Unser Haushalt');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      setEmail(user.email);
      void households.householdForUser(user.uid).then((existing) => {
        if (existing) {
          router.replace('/heute');
        }
      });
    });
  }, [router]);

  async function create() {
    if (!uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const draft = startHousehold({
        name,
        ownerId: uid,
        ownerEmail: email ?? undefined,
        createdAt: new Date().toISOString(),
        invitePin: newInvitePin(),
      });
      await households.createHousehold(draft);
      router.replace('/heute');
    } catch (err) {
      console.error('[onboarding create]', err);
      setError(
        err instanceof Error && err.message === 'household_name_required'
          ? 'Bitte einen Haushaltsnamen eingeben.'
          : messageFromStoreError(err, 'Haushalt konnte nicht angelegt werden.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    if (!uid) {
      return;
    }
    const parsedEmail = parseEmailAddress(email ?? '');
    if (!parsedEmail.ok) {
      setError('Dieses Konto hat keine gültige E-Mail. Bitte mit E-Mail anmelden.');
      return;
    }
    const parsedPin = parseInvitePin(pin);
    if (!parsedPin.ok) {
      setError(invitePinReasonMessage(parsedPin.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const invited = await households.householdsForInvitedEmail(parsedEmail.email);
      const found = householdForJoinPin(invited, parsedPin.pin);
      if (!found) {
        setError(
          invited.length === 0
            ? joinHouseholdMessage('email_not_invited')
            : joinHouseholdMessage('invalid_pin'),
        );
        return;
      }
      const result = joinHousehold(found, {
        userId: uid,
        email: parsedEmail.email,
        pin: parsedPin.pin,
      });
      if (!result.ok) {
        setError(joinHouseholdMessage(result.reason));
        return;
      }
      await households.saveHousehold(result.household);
      router.replace('/heute');
    } catch (err) {
      console.error('[onboarding join]', err);
      setError(messageFromStoreError(err, 'Beitritt nicht möglich.'));
    } finally {
      setBusy(false);
    }
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.paper,
    },
    content: {
      padding: 24,
      gap: 16,
      justifyContent: 'center',
      flexGrow: 1,
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
      fontSize: 16,
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
  });

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.title}>Mit PIN beitreten</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>
          Nur PIN. Der Haushaltsname wird nicht gebraucht. Die E-Mail des Kontos muss auf der Liste stehen.
        </Text>
        <TextInput
          style={styles.input}
          value={pin}
          editable={!busy}
          onChangeText={setPin}
          placeholder="PIN"
          placeholderTextColor={theme.inkFaint}
          keyboardType="number-pad"
        />
        <Pressable style={styles.btn} onPress={() => void join()} disabled={busy}>
          <Text style={styles.btnText}>{busy ? 'Bitte warten…' : 'Beitreten'}</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Neuen Haushalt anlegen</Text>
        <View style={styles.rule} />
        <TextInput
          style={styles.input}
          value={name}
          editable={!busy}
          onChangeText={setName}
          placeholder="Haushaltsname"
          placeholderTextColor={theme.inkFaint}
        />
        <Pressable style={[styles.btn, styles.ghost]} onPress={() => void create()} disabled={busy}>
          <Text style={[styles.btnText, styles.ghostText]}>
            {busy ? 'Bitte warten…' : 'Haushalt anlegen'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
