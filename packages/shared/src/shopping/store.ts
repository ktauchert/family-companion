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
import type { ShoppingItem } from '../types';
import { normalizeShoppingItem, shoppingItemNeedsListMigration, type LegacyShoppingItem } from './migrate';

function asShoppingItem(id: string, data: LegacyShoppingItem): ShoppingItem {
  return normalizeShoppingItem({ ...data, id });
}

export function shoppingStore(db: Firestore) {
  const items = () => collection(db, FIRESTORE_COLLECTIONS.shoppingItems);

  return {
    async listForHousehold(householdId: string): Promise<ShoppingItem[]> {
      const snap = await getDocs(query(items(), where('householdId', '==', householdId)));
      return snap.docs.map((item) => asShoppingItem(item.id, item.data() as LegacyShoppingItem));
    },

    async itemById(itemId: string): Promise<ShoppingItem | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.shoppingItems, itemId));
      if (!snap.exists()) {
        return null;
      }
      return asShoppingItem(snap.id, snap.data() as LegacyShoppingItem);
    },

    async createItem(item: ShoppingItem): Promise<ShoppingItem> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id),
        firestoreDocumentPayload(item),
      );
      return item;
    },

    async saveItem(item: ShoppingItem): Promise<void> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id),
        firestoreDocumentPayload(item),
      );
    },

    async saveItems(items: ShoppingItem[]): Promise<void> {
      await Promise.all(
        items.map((item) =>
          setDoc(
            doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id),
            firestoreDocumentPayload(item),
          ),
        ),
      );
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
          onChange(
            snap.docs.map((item) => {
              const data = item.data() as LegacyShoppingItem;
              const normalized = asShoppingItem(item.id, data);
              if (shoppingItemNeedsListMigration({ ...data, id: item.id })) {
                void setDoc(
                  doc(db, FIRESTORE_COLLECTIONS.shoppingItems, item.id),
                  firestoreDocumentPayload(normalized),
                );
              }
              return normalized;
            }),
          );
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type ShoppingStore = ReturnType<typeof shoppingStore>;
