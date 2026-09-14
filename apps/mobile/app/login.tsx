import {
  emailPasswordReasonMessage,
  googleSignInPath,
  messageFromAuthError,
  parseEmailPassword,
} from '@family-companion/shared';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import Constants from 'expo-constants';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { pathAfterAuth } from '../lib/after-auth';
import { NativeGoogleButton } from '../lib/auth/native-google-button';
import { auth } from '../lib/firebase';
import { useTheme } from '../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const theme = useTheme();
  const isExpoGo = Constants.appOwnership === 'expo';
  const googlePath = googleSignInPath({ isExpoGo });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function afterSignIn(uid: string) {
    router.replace(await pathAfterAuth(uid, next));
  }

  async function signInEmail() {
    const parsed = parseEmailPassword({ email, password });
    if (!parsed.ok) {
      setError(emailPasswordReasonMessage(parsed.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, parsed.email, parsed.password);
      await afterSignIn(cred.user.uid);
    } catch (err) {
      setError(messageFromAuthError(err, 'sign-in'));
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
        <Text style={styles.title}>Anmelden</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>
          {googlePath === 'unavailable'
            ? 'Expo Go: mit E-Mail anmelden. Google erst im Dev-Build.'
            : 'E-Mail/Passwort oder natives Google.'}
        </Text>
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
          autoComplete="current-password"
          editable={!busy}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable style={styles.btn} onPress={() => void signInEmail()} disabled={busy}>
          <Text style={styles.btnText}>{busy ? 'Bitte warten…' : 'Anmelden'}</Text>
        </Pressable>
        {googlePath === 'native' ? (
          <NativeGoogleButton
            disabled={busy}
            ink={theme.ink}
            well={theme.well}
            onSignedIn={afterSignIn}
            onError={setError}
          />
        ) : null}
        <Link
          href={next ? { pathname: '/register', params: { next } } : '/register'}
          style={styles.link}
        >
          Noch kein Konto? Registrieren
        </Link>
      </View>
    </View>
  );
}
