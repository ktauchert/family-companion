import { MorningCheckInInputSchema } from '../../schemas';
import type { Household, MorningCheckIn } from '../../types';
import { localDateString } from '../dates';
import { canCreateMorningCheckIn, canUpdateMorningCheckIn } from './permissions';

export type CreateMorningCheckInInput = {
  actorId: string;
  household: Household;
  checkInId: string;
  mood: number;
  energy: number;
  date: string;
  existingForUserOnDate: MorningCheckIn | null;
};

export type CreateMorningCheckInResult =
  | { ok: true; checkIn: MorningCheckIn }
  | {
      ok: false;
      reason: 'not_allowed' | 'invalid_input' | 'already_exists';
    };

export type UpdateMorningCheckInResult =
  | { ok: true; checkIn: MorningCheckIn }
  | {
      ok: false;
      reason: 'not_allowed' | 'invalid_input';
    };

export function prepareCreateMorningCheckIn(
  input: CreateMorningCheckInInput,
): CreateMorningCheckInResult {
  if (!canCreateMorningCheckIn({ actorId: input.actorId, household: input.household, userId: input.actorId })) {
    return { ok: false, reason: 'not_allowed' };
  }

  if (input.existingForUserOnDate) {
    return { ok: false, reason: 'already_exists' };
  }

  const parsed = MorningCheckInInputSchema.safeParse({
    mood: input.mood,
    energy: input.energy,
    date: input.date,
  });
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_input' };
  }

  const checkIn: MorningCheckIn = {
    id: input.checkInId,
    householdId: input.household.id,
    userId: input.actorId,
    date: parsed.data.date,
    mood: parsed.data.mood,
    energy: parsed.data.energy,
  };

  return { ok: true, checkIn };
}

export function prepareUpdateMorningCheckIn(input: {
  actorId: string;
  household: Household;
  checkIn: MorningCheckIn;
  mood: number;
  energy: number;
  today?: string;
}): UpdateMorningCheckInResult {
  if (
    !canUpdateMorningCheckIn({
      actorId: input.actorId,
      household: input.household,
      checkIn: input.checkIn,
      today: input.today,
    })
  ) {
    return { ok: false, reason: 'not_allowed' };
  }

  const parsed = MorningCheckInInputSchema.safeParse({
    mood: input.mood,
    energy: input.energy,
    date: input.checkIn.date,
  });
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_input' };
  }

  return {
    ok: true,
    checkIn: {
      ...input.checkIn,
      mood: parsed.data.mood,
      energy: parsed.data.energy,
    },
  };
}

export function morningCheckInId(householdId: string, userId: string, date: string): string {
  return `${householdId}_${userId}_${date}`;
}

export function morningCheckInErrorMessage(
  reason: 'not_allowed' | 'invalid_input' | 'already_exists',
): string {
  switch (reason) {
    case 'not_allowed':
      return 'Check-in ist nicht erlaubt.';
    case 'invalid_input':
      return 'Stimmung und Energie müssen zwischen 1 und 5 liegen.';
    case 'already_exists':
      return 'Für heute gibt es schon einen Check-in.';
  }
}
