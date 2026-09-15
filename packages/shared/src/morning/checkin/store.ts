import type { Firestore } from 'firebase/firestore';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../../firebase/config';
import type { MorningCheckIn } from '../../types';

function asMorningCheckIn(id: string, data: MorningCheckIn): MorningCheckIn {
  return { ...data, id };
}

export function morningCheckInStore(db: Firestore) {
  const checkIns = () => collection(db, FIRESTORE_COLLECTIONS.morningCheckIns);

  return {
    async listForHousehold(householdId: string): Promise<MorningCheckIn[]> {
      const snap = await getDocs(query(checkIns(), where('householdId', '==', householdId)));
      return snap.docs.map((item) => asMorningCheckIn(item.id, item.data() as MorningCheckIn));
    },

    async listForHouseholdOnDate(householdId: string, date: string): Promise<MorningCheckIn[]> {
      const snap = await getDocs(
        query(
          checkIns(),
          where('householdId', '==', householdId),
          where('date', '==', date),
        ),
      );
      return snap.docs.map((item) => asMorningCheckIn(item.id, item.data() as MorningCheckIn));
    },

    async checkInById(checkInId: string): Promise<MorningCheckIn | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.morningCheckIns, checkInId));
      if (!snap.exists()) {
        return null;
      }
      return asMorningCheckIn(snap.id, snap.data() as MorningCheckIn);
    },

    async createCheckIn(checkIn: MorningCheckIn): Promise<MorningCheckIn> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.morningCheckIns, checkIn.id), checkIn);
      return checkIn;
    },

    async saveCheckIn(checkIn: MorningCheckIn): Promise<void> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.morningCheckIns, checkIn.id), checkIn);
    },

    subscribeForHouseholdOnDate(
      householdId: string,
      date: string,
      onChange: (items: MorningCheckIn[]) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        query(
          checkIns(),
          where('householdId', '==', householdId),
          where('date', '==', date),
        ),
        (snap) => {
          onChange(snap.docs.map((item) => asMorningCheckIn(item.id, item.data() as MorningCheckIn)));
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type MorningCheckInStore = ReturnType<typeof morningCheckInStore>;
