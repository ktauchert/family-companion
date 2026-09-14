import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name} in apps/mobile/.env.local`);
  }
  return value;
}

const app = getApps()[0]
  ? getApp()
  : initializeApp({
      apiKey: required(
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        'EXPO_PUBLIC_FIREBASE_API_KEY',
      ),
      authDomain: required(
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      ),
      projectId: required(
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      ),
      storageBucket: required(
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      ),
      messagingSenderId: required(
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      ),
      appId: required(
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        'EXPO_PUBLIC_FIREBASE_APP_ID',
      ),
    });

type ReactNativeAuth = {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

function authInstance() {
  try {
    // RN-Export; die Web-Typen von firebase/auth kennen ihn nicht.
    const { getReactNativePersistence } = require('firebase/auth') as ReactNativeAuth;
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = authInstance();
export const db = getFirestore(app);
