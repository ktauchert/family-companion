import type { Household } from '@family-companion/shared';

/** Wird entfernt, sobald die Expo-App steht. */
export const placeholderHousehold: Household = {
  id: 'hh_placeholder',
  name: 'Placeholder',
  plan: 'free',
  members: [],
  createdAt: new Date().toISOString(),
};
