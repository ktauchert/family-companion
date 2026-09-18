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
import { firestoreDocumentPayload } from '../firebase/document';
import type { ShoppingList } from '../types';

function asShoppingList(id: string, data: ShoppingList): ShoppingList {
  return { ...data, id };
}

export function shoppingListsStore(db: Firestore) {
  const lists = () => collection(db, FIRESTORE_COLLECTIONS.shoppingLists);

  return {
    async listForHousehold(householdId: string): Promise<ShoppingList[]> {
      const snap = await getDocs(query(lists(), where('householdId', '==', householdId)));
      return snap.docs
        .map((entry) => asShoppingList(entry.id, entry.data() as ShoppingList))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    },

    async listById(listId: string): Promise<ShoppingList | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingLists, listId));
      if (!snap.exists()) {
        return null;
      }
      return asShoppingList(snap.id, snap.data() as ShoppingList);
    },

    async createList(list: ShoppingList): Promise<ShoppingList> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.shoppingLists, list.id),
        firestoreDocumentPayload(list),
      );
      return list;
    },

    async saveList(list: ShoppingList): Promise<void> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.shoppingLists, list.id),
        firestoreDocumentPayload(list),
      );
    },

    async deleteList(listId: string): Promise<void> {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingLists, listId));
    },

    subscribeForHousehold(
      householdId: string,
      onChange: (lists: ShoppingList[]) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        query(lists(), where('householdId', '==', householdId)),
        (snap) => {
          onChange(
            snap.docs
              .map((entry) => asShoppingList(entry.id, entry.data() as ShoppingList))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
          );
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type ShoppingListsStore = ReturnType<typeof shoppingListsStore>;
