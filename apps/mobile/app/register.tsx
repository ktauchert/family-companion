import {
  emailPasswordReasonMessage,
  messageFromAuthError,
  parseEmailPassword,
} from '@family-companion/shared';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { pathAfterAuth } from '../lib/after-auth';
import { auth } from '../lib/firebase';
import { useTheme } from '../lib/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const next = typeof params.next === 'string' ? params.next : undefined;

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      void pathAfterAuth(user.uid, next).then((href) => {
        router.replace(href);
      });
    });
  }, [next, router]);

  async function register() {
    const parsed = parseEmailPassword({ email, password, confirmPassword });
    if (!parsed.ok) {
      setError(emailPasswordReasonMessage(parsed.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        parsed.email,
        parsed.password,
      );
      router.replace(await pathAfterAuth(cred.user.uid, next));
    } catch (err) {
      setError(messageFromAuthError(err, 'register'));
    } finally {
      setBusy(false);
    }
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.paper,
      justifyContent: 'center',
      padding: 24,
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
    btnText: {
      color: theme.paper,
      fontSize: 16,
    },
    link: {
      color: theme.inkSoft,
      fontSize: 15,
    },
    err: {
      color: theme.rust,
    },
  });

  if (!ready) {
    return (
      <View style={styles.page}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrieren</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>Neues Konto mit E-Mail und Passwort (mindestens 6 Zeichen).</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="E-Mail"
          placeholderTextColor={theme.inkFaint}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!busy}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Passwort"
          placeholderTextColor={theme.inkFaint}
          secureTextEntry
          autoComplete="new-password"
          editable={!busy}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Passwort wiederholen"
          placeholderTextColor={theme.inkFaint}
          secureTextEntry
          autoComplete="new-password"
          editable={!busy}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Pressable style={styles.btn} onPress={() => void register()} disabled={busy}>
          <Text style={styles.btnText}>{busy ? 'Bitte warten…' : 'Konto erstellen'}</Text>
        </Pressable>
        <Link href={next ? { pathname: '/login', params: { next } } : '/login'} style={styles.link}>
          Schon ein Konto? Anmelden
        </Link>
      </View>
    </View>
  );
}
