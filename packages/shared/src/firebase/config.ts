export const FIRESTORE_COLLECTIONS = {
  households: 'households',
  shoppingLists: 'shopping_lists',
  shoppingItems: 'shopping_items',
  todos: 'todos',
  calendarEvents: 'calendar_events',
  morningCheckIns: 'morning_checkins',
} as const;

export const FREE_TIER_MAX_MEMBERS = 2;

export const SHOPPING_CATEGORIES = [
  'supermarket',
  'drugstore',
  'pharmacy',
  'clothing',
  'other',
] as const;
