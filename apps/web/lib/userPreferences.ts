'use client';

import { userPreferencesStore } from '@family-companion/shared';
import { db } from './firebase';

export const userPreferences = userPreferencesStore(db);
