import { todoStore } from '@family-companion/shared';
import { db } from './firebase';

export const todos = todoStore(db);
