import { authErrorDetails, messageFromAuthError } from '@family-companion/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { auth } from '../firebase';

export function NativeGoogleButton({
  disabled,
  ink,
  well,
  onSignedIn,
  onError,
}: {
  disabled: boolean;
  ink: string;
  well: string;
  onSignedIn: (uid: string) => Promise<void>;
  onError: (message: string, details?: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onPress() {
    setBusy(true);
    try {
      const { signInWithGoogleNative } = await import('./native-google');
      await signInWithGoogleNative();
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('Kein User nach dem Login');
      }
      await onSignedIn(uid);
    } catch (err) {
      console.error('[google-native]', authErrorDetails(err));
      onError(messageFromAuthError(err, 'google'), authErrorDetails(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      style={[styles.btn, { backgroundColor: well }]}
      onPress={() => void onPress()}
      disabled={disabled || busy}
    >
      <Text style={[styles.text, { color: ink }]}>
        {busy ? 'Bitte warten…' : 'Mit Google anmelden'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});
