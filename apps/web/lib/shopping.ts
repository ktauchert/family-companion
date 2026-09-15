'use client';

import { shoppingStore } from '@family-companion/shared';
import { db } from './firebase';

export const shopping = shoppingStore(db);
