import type { Household } from '../types';

export function isHouseholdMember(actorId: string, household: Household): boolean {
  return household.members.includes(actorId);
}

export function isHouseholdOwner(actorId: string, household: Household): boolean {
  const ownerId = household.ownerId || household.members[0] || '';
  return isHouseholdMember(actorId, household) && actorId === ownerId;
}
