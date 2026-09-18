import type { Household } from '../types';

export type UpgradeHouseholdPlanInput = {
  actorId: string;
};

export type UpgradeHouseholdPlanResult =
  | { ok: true; household: Household }
  | { ok: false; reason: 'not_owner' | 'already_pro' };

export function upgradeHouseholdToPro(
  household: Household,
  input: UpgradeHouseholdPlanInput,
): UpgradeHouseholdPlanResult {
  const ownerId = household.ownerId || household.members[0] || '';
  if (input.actorId !== ownerId) {
    return { ok: false, reason: 'not_owner' };
  }

  if (household.plan === 'pro') {
    return { ok: false, reason: 'already_pro' };
  }

  return {
    ok: true,
    household: { ...household, plan: 'pro' },
  };
}

export function upgradeHouseholdPlanMessage(
  reason: Exclude<UpgradeHouseholdPlanResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'not_owner':
      return 'Nur der Inhaber kann Family+ aktivieren.';
    case 'already_pro':
      return 'Family+ ist schon aktiv.';
  }
}
