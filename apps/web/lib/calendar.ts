'use client';

import { calendarEventStore } from '@family-companion/shared';
import { db } from './firebase';

export const calendar = calendarEventStore(db);
