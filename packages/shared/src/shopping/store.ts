import type { Firestore } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../firebase/config';
import type { ShoppingItem } from '../types';

function asShoppingItem(id: string, data: ShoppingItem): ShoppingItem {
  return { ...data, id };
}

export function shoppingStore(db: Firestore) {
  const items = () => collection(db, FIRESTORE_COLLECTIONS.shoppingItems);

  return {
    async listForHousehold(householdId: string): Promise<ShoppingItem[]> {
      const snap = await getDocs(query(items(), where('householdId', '==', householdId)));
      return snap.docs.map((item) => asShoppingItem(item.id, item.data() as ShoppingItem));
    },

    async itemById(itemId: string): Promise<ShoppingItem | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingItems, itemId));
      if (!snap.exists()) {
        return null;
      }
      return asShoppingItem(snap.id, snap.data() as ShoppingItem);
    },

    async createItem(item: ShoppingItem): Promise<ShoppingItem> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id), item);
      return item;
    },

    async saveItem(item: ShoppingItem): Promise<void> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id), item);
    },

    async deleteItem(itemId: string): Promise<void> {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingItems, itemId));
    },

    subscribeForHousehold(
      householdId: string,
      onChange: (items: ShoppingItem[]) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        query(items(), where('householdId', '==', householdId)),
        (snap) => {
          onChange(snap.docs.map((item) => asShoppingItem(item.id, item.data() as ShoppingItem)));
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type ShoppingStore = ReturnType<typeof shoppingStore>;
