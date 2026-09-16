import { householdMembers } from '../household/membership';
import type { Household } from '../types';

export type AssigneeCountDisplay = {
  count: number;
  label: string;
  actorIncluded: boolean;
};

export function personCountLabel(count: number): string {
  return count === 1 ? '1 Person' : `${count} Personen`;
}

export function assigneeCountDisplay(
  household: Household,
  assignedTo: string[] | undefined,
  actorId: string,
): AssigneeCountDisplay {
  const explicit = assignedTo ?? [];
  const count = explicit.length === 0 ? householdMembers(household).length : explicit.length;
  const actorIncluded = explicit.length === 0 || explicit.includes(actorId);
  return {
    count,
    label: personCountLabel(count),
    actorIncluded,
  };
}
