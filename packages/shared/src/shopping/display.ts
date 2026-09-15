import { householdMemberLabel } from '../household/membership';
import type { Household, ShoppingCategory } from '../types';

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  supermarket: 'Supermarkt',
  drugstore: 'Drogerie',
  pharmacy: 'Apotheke',
  clothing: 'Klamotten',
  other: 'Sonstiges',
};

export function shoppingAddedByLabel(household: Household, addedBy: string): string {
  return householdMemberLabel(household.memberEmails?.[addedBy] ?? null);
}
