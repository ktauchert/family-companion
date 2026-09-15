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
import type { TodoItem } from '../types';

function asTodoItem(id: string, data: TodoItem): TodoItem {
  return { ...data, id };
}

export function todoStore(db: Firestore) {
  const todos = () => collection(db, FIRESTORE_COLLECTIONS.todos);

  return {
    async listForHousehold(householdId: string): Promise<TodoItem[]> {
      const snap = await getDocs(query(todos(), where('householdId', '==', householdId)));
      return snap.docs.map((item) => asTodoItem(item.id, item.data() as TodoItem));
    },

    async todoById(todoId: string): Promise<TodoItem | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.todos, todoId));
      if (!snap.exists()) {
        return null;
      }
      return asTodoItem(snap.id, snap.data() as TodoItem);
    },

    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.todos, todo.id), firestoreDocumentPayload(todo));
      return todo;
    },

    async saveTodo(todo: TodoItem): Promise<void> {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.todos, todo.id), firestoreDocumentPayload(todo));
    },

    async deleteTodo(todoId: string): Promise<void> {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.todos, todoId));
    },

    subscribeForHousehold(
      householdId: string,
      onChange: (items: TodoItem[]) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        query(todos(), where('householdId', '==', householdId)),
        (snap) => {
          onChange(snap.docs.map((item) => asTodoItem(item.id, item.data() as TodoItem)));
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type TodoStore = ReturnType<typeof todoStore>;
