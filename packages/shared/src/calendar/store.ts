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
import type { CalendarEvent } from '../types';

function asCalendarEvent(id: string, data: CalendarEvent): CalendarEvent {
  return { ...data, id };
}

export function calendarEventStore(db: Firestore) {
  const events = () => collection(db, FIRESTORE_COLLECTIONS.calendarEvents);

  return {
    async listForHousehold(householdId: string): Promise<CalendarEvent[]> {
      const snap = await getDocs(query(events(), where('householdId', '==', householdId)));
      return snap.docs.map((item) => asCalendarEvent(item.id, item.data() as CalendarEvent));
    },

    async eventById(eventId: string): Promise<CalendarEvent | null> {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.calendarEvents, eventId));
      if (!snap.exists()) {
        return null;
      }
      return asCalendarEvent(snap.id, snap.data() as CalendarEvent);
    },

    async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.calendarEvents, event.id),
        firestoreDocumentPayload(event),
      );
      return event;
    },

    async saveEvent(event: CalendarEvent): Promise<void> {
      await setDoc(
        doc(db, FIRESTORE_COLLECTIONS.calendarEvents, event.id),
        firestoreDocumentPayload(event),
      );
    },

    async deleteEvent(eventId: string): Promise<void> {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.calendarEvents, eventId));
    },

    subscribeForHousehold(
      householdId: string,
      onChange: (events: CalendarEvent[]) => void,
      onError?: (error: Error) => void,
    ): Unsubscribe {
      return onSnapshot(
        query(events(), where('householdId', '==', householdId)),
        (snap) => {
          onChange(snap.docs.map((item) => asCalendarEvent(item.id, item.data() as CalendarEvent)));
        },
        (err) => onError?.(err),
      );
    },
  };
}

export type CalendarEventStore = ReturnType<typeof calendarEventStore>;
