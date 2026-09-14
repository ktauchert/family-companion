import { householdStore } from '@family-companion/shared';
import { db } from './firebase';

export const households = householdStore(db);
