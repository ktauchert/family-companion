import { FREE_TIER_MAX_MEMBERS } from '../firebase/config';
import type { SubscriptionPlan } from '../types';

export function canAddHouseholdMember(
  plan: SubscriptionPlan,
  currentMemberCount: number,
): boolean {
  if (plan === 'pro') {
    return true;
  }

  return currentMemberCount < FREE_TIER_MAX_MEMBERS;
}
