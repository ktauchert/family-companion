import type { Firestore } from 'firebase/firestore';
import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../firebase/config';
import { firestoreDocumentPayload } from '../firebase/document';
import type { UserPreferences } from '../types';
import { defaultUserPreferences } from './item';

function asUserPreferences(userId: string, data: UserPreferences): UserPreferences {
  return { ...data, userId };
}

export function userPreferencesStore(db: Firestore) {
  return {
    async preferencesForUser(userId: string): Promise<UserPreferences> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.userPreferences, userId));
      if (!snap.exists()) {
        return defaultUserPreferences(userId);
      }
      return asUserPreferences(userId, snap.data() as UserPreferences);
    },

    async savePreferences(preferences: UserPreferences): Promise<UserPreferences> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.userPreferences, preferences.userId),
        firestoreDocumentPayload(preferences),
      );
      return preferences;
    },

    subscribeForUser(
      userId: string,
      onChange: (preferences: UserPreferences) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        doc(db, FIRESTORE_COLLECTIONS.userPreferences, userId),
        (snap) => {
          onChange(
            snap.exists()
              ? asUserPreferences(userId, snap.data() as UserPreferences)
              : defaultUserPreferences(userId),
          );
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type UserPreferencesStore = ReturnType<typeof userPreferencesStore>;
