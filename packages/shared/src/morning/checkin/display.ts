import { householdMemberLabel } from '../../household/membership';
import type { Household, MorningCheckIn } from '../../types';

export function formatMorningCheckInMemberLine(checkIn: MorningCheckIn, household: Household): string {
  const name = householdMemberLabel(household.memberEmails?.[checkIn.userId] ?? null);
  return `${name} ${checkIn.mood}/${checkIn.energy}`;
}

/** Compact chip copy for Heute after save — mood/energy per member. */
export function formatMorningCheckInChip(checkIns: MorningCheckIn[], household: Household): string {
  if (checkIns.length === 0) {
    return '';
  }
  const sorted = [...checkIns].sort((a, b) => {
    const aName = householdMemberLabel(household.memberEmails?.[a.userId] ?? null);
    const bName = householdMemberLabel(household.memberEmails?.[b.userId] ?? null);
    return aName.localeCompare(bName);
  });
  return `Check-in · ${sorted.map((entry) => formatMorningCheckInMemberLine(entry, household)).join(' · ')}`;
}
