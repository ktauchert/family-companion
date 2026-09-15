import { householdMemberLabel } from '../household/membership';
import type { Household, MemberCompletion } from '../types';

export function itemOpenClosedLabel(done: boolean): string {
  return done ? 'Erledigt' : 'Offen';
}

export function perMemberCompletionLabel(
  household: Household,
  completions: MemberCompletion[],
): string {
  if (completions.length === 0) {
    return 'Offen';
  }
  const doneCount = completions.filter((entry) => entry.done).length;
  if (doneCount === completions.length) {
    return 'Erledigt';
  }
  const names = completions
    .filter((entry) => entry.done)
    .map((entry) => householdMemberLabel(household.memberEmails?.[entry.userId] ?? null))
    .join(', ');
  return names.length > 0 ? `${doneCount}/${completions.length} erledigt (${names})` : `${doneCount}/${completions.length} erledigt`;
}
