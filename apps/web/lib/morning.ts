'use client';

import { morningCheckInStore } from '@family-companion/shared';
import { db } from './firebase';

export const morning = morningCheckInStore(db);
