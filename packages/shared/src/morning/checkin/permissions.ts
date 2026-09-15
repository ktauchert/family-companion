import { isHouseholdMember } from '../../household/access';
import type { Household, MorningCheckIn } from '../../types';
import { localDateString } from '../dates';

export type MorningCheckInAccessContext = {
  actorId: string;
  household: Household;
  checkIn: MorningCheckIn;
};

export function canReadMorningCheckIn(ctx: MorningCheckInAccessContext): boolean {
  return (
    isHouseholdMember(ctx.actorId, ctx.household) &&
    ctx.checkIn.householdId === ctx.household.id
  );
}

export function canCreateMorningCheckIn(ctx: {
  actorId: string;
  household: Household;
  userId: string;
}): boolean {
  return isHouseholdMember(ctx.actorId, ctx.household) && ctx.actorId === ctx.userId;
}

export function canUpdateMorningCheckIn(ctx: {
  actorId: string;
  household: Household;
  checkIn: MorningCheckIn;
  today?: string;
}): boolean {
  if (!canReadMorningCheckIn({ actorId: ctx.actorId, household: ctx.household, checkIn: ctx.checkIn })) {
    return false;
  }
  if (ctx.actorId !== ctx.checkIn.userId) {
    return false;
  }
  const today = ctx.today ?? localDateString();
  return ctx.checkIn.date === today;
}

export function canDeleteMorningCheckIn(): boolean {
  return false;
}
