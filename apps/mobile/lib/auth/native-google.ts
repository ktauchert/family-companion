import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase';

/** Nur in Dev-Build / Store laden — nie statisch aus Expo-Go-Code. */
export async function signInWithGoogleNative(): Promise<void> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }

  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  const idToken =
    'data' in result && result.data
      ? result.data.idToken
      : (result as { idToken?: string }).idToken;

  if (!idToken) {
    throw new Error('Google Sign-In lieferte kein idToken');
  }

  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}
