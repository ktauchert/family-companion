import type { Firestore } from 'firebase/firestore';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../firebase/config';
import type { Household, HouseholdDraft } from '../types';

function asHousehold(id: string, data: Household): Household {
  return { ...data, id };
}

export function householdStore(db: Firestore) {
  const households = () => collection(db, FIRESTORE_COLLECTIONS.households);

  return {
    async createHousehold(draft: HouseholdDraft): Promise<Household> {
      const ref = doc(households());
      const household: Household = { ...draft, id: ref.id };
      await setDoc(ref, household);
      return household;
    },

    async saveHousehold(household: Household): Promise<void> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.households, household.id), household);
    },

    async householdForUser(userId: string): Promise<Household | null> {
      const snap = await getDocs(
        query(households(), where('members', 'array-contains', userId)),
      );
      const first = snap.docs[0];
      return first ? asHousehold(first.id, first.data() as Household) : null;
    },

    async householdsForInvitedEmail(email: string): Promise<Household[]> {
      const snap = await getDocs(
        query(households(), where('invitedEmails', 'array-contains', email)),
      );
      return snap.docs.map((item) => asHousehold(item.id, item.data() as Household));
    },
  };
}

export type HouseholdStore = ReturnType<typeof householdStore>;
