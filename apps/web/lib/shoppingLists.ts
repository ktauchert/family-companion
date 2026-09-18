'use client';

import { shoppingListsStore } from '@family-companion/shared';
import { db } from './firebase';

export const shoppingLists = shoppingListsStore(db);
