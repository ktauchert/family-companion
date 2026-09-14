import { parseEmailAddress } from '../auth/email-password';
import type { Household, HouseholdDraft } from '../types';
import { canAddHouseholdMember } from './can-add-member';

export type StartHouseholdInput = {
  name: string;
  ownerId: string;
  ownerEmail?: string;
  createdAt: string;
  invitePin: string;
};

export type InviteToHouseholdInput = {
  actorId: string;
  email: string;
};

export type InviteToHouseholdResult =
  | { ok: true; household: Household }
  | {
      ok: false;
      reason: 'not_owner' | 'email_required' | 'email_invalid' | 'already_invited' | 'limit_reached';
    };

export type JoinHouseholdInput = {
  userId: string;
  email: string;
  pin: string;
};

export type JoinHouseholdResult =
  | { ok: true; household: Household }
  | {
      ok: false;
      reason: 'invalid_pin' | 'email_not_invited' | 'already_member' | 'limit_reached';
    };

export function startHousehold(input: StartHouseholdInput): HouseholdDraft {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error('household_name_required');
  }

  const memberEmails: Record<string, string> = {};
  if (input.ownerEmail) {
    const parsedOwner = parseEmailAddress(input.ownerEmail);
    if (parsedOwner.ok) {
      memberEmails[input.ownerId] = parsedOwner.email;
    }
  }

  return {
    name,
    plan: 'free',
    ownerId: input.ownerId,
    members: [input.ownerId],
    memberEmails,
    createdAt: input.createdAt,
    invitePin: input.invitePin,
    invitedEmails: [],
  };
}

export function inviteToHousehold(
  household: Household,
  input: InviteToHouseholdInput,
): InviteToHouseholdResult {
  if (input.actorId !== household.ownerId) {
    return { ok: false, reason: 'not_owner' };
  }

  const parsed = parseEmailAddress(input.email);
  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason };
  }

  const invitedEmails = household.invitedEmails ?? [];

  if (invitedEmails.includes(parsed.email)) {
    return { ok: false, reason: 'already_invited' };
  }

  if (!canAddHouseholdMember(household.plan, household.members.length)) {
    return { ok: false, reason: 'limit_reached' };
  }

  return {
    ok: true,
    household: {
      ...household,
      invitedEmails: household.plan === 'free' ? [parsed.email] : [...invitedEmails, parsed.email],
    },
  };
}

export function joinHousehold(
  household: Household,
  input: JoinHouseholdInput,
): JoinHouseholdResult {
  if (input.pin !== household.invitePin) {
    return { ok: false, reason: 'invalid_pin' };
  }

  const invitedEmails = household.invitedEmails ?? [];
  const parsed = parseEmailAddress(input.email);
  if (!parsed.ok || !invitedEmails.includes(parsed.email)) {
    return { ok: false, reason: 'email_not_invited' };
  }

  if (household.members.includes(input.userId)) {
    return { ok: false, reason: 'already_member' };
  }

  if (!canAddHouseholdMember(household.plan, household.members.length)) {
    return { ok: false, reason: 'limit_reached' };
  }

  const memberEmails = { ...(household.memberEmails ?? {}) };
  memberEmails[input.userId] = parsed.email;

  return {
    ok: true,
    household: {
      ...household,
      members: [...household.members, input.userId],
      memberEmails,
      invitedEmails: invitedEmails.filter((email) => email !== parsed.email),
    },
  };
}

export function householdForJoinPin(
  invitedHouseholds: Household[],
  pin: string,
): Household | null {
  return invitedHouseholds.find((item) => item.invitePin === pin) ?? null;
}

export type InviteChangeResult =
  | { ok: true; household: Household }
  | {
      ok: false;
      reason: 'not_owner' | 'email_required' | 'email_invalid' | 'not_invited' | 'already_invited';
    };

export function withdrawInvite(
  household: Household,
  input: InviteToHouseholdInput,
): InviteChangeResult {
  if (input.actorId !== household.ownerId) {
    return { ok: false, reason: 'not_owner' };
  }
  const parsed = parseEmailAddress(input.email);
  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason };
  }
  const invitedEmails = household.invitedEmails ?? [];
  if (!invitedEmails.includes(parsed.email)) {
    return { ok: false, reason: 'not_invited' };
  }
  return {
    ok: true,
    household: {
      ...household,
      invitedEmails: invitedEmails.filter((email) => email !== parsed.email),
    },
  };
}

export function updateInvitedEmail(
  household: Household,
  input: { actorId: string; fromEmail: string; toEmail: string },
): InviteChangeResult {
  if (input.actorId !== household.ownerId) {
    return { ok: false, reason: 'not_owner' };
  }
  const from = parseEmailAddress(input.fromEmail);
  if (!from.ok) {
    return { ok: false, reason: from.reason };
  }
  const to = parseEmailAddress(input.toEmail);
  if (!to.ok) {
    return { ok: false, reason: to.reason };
  }
  const invitedEmails = household.invitedEmails ?? [];
  if (!invitedEmails.includes(from.email)) {
    return { ok: false, reason: 'not_invited' };
  }
  if (from.email === to.email) {
    return { ok: true, household };
  }
  if (invitedEmails.includes(to.email)) {
    return { ok: false, reason: 'already_invited' };
  }
  return {
    ok: true,
    household: {
      ...household,
      invitedEmails: invitedEmails.map((email) => (email === from.email ? to.email : email)),
    },
  };
}

export function householdMembers(household: Household): Array<{
  userId: string;
  email: string | null;
  role: 'owner' | 'member';
}> {
  const emails = household.memberEmails ?? {};
  const ownerId = household.ownerId || household.members[0] || '';
  return household.members.map((userId) => ({
    userId,
    email: emails[userId] ?? null,
    role: userId === ownerId ? 'owner' : 'member',
  }));
}

export function householdMemberLabel(email: string | null): string {
  return email ?? 'E-Mail unbekannt';
}

export function ensureMemberEmail(
  household: Household,
  input: { userId: string; email: string },
): Household {
  if (!household.members.includes(input.userId)) {
    return household;
  }
  if (household.memberEmails?.[input.userId]) {
    return household;
  }
  const parsed = parseEmailAddress(input.email);
  if (!parsed.ok) {
    return household;
  }
  return {
    ...household,
    memberEmails: { ...(household.memberEmails ?? {}), [input.userId]: parsed.email },
  };
}

export type RemoveHouseholdMemberInput = {
  actorId: string;
  memberId: string;
};

export type RemoveHouseholdMemberResult =
  | { ok: true; household: Household }
  | {
      ok: false;
      reason: 'not_member' | 'not_allowed' | 'cannot_remove_owner';
    };

export function removeHouseholdMember(
  household: Household,
  input: RemoveHouseholdMemberInput,
): RemoveHouseholdMemberResult {
  if (!household.members.includes(input.memberId)) {
    return { ok: false, reason: 'not_member' };
  }
  const ownerId = household.ownerId || household.members[0];
  if (input.memberId === ownerId) {
    return { ok: false, reason: 'cannot_remove_owner' };
  }
  const actorIsOwner = input.actorId === ownerId;
  const actorIsTarget = input.actorId === input.memberId;
  if (!actorIsOwner && !actorIsTarget) {
    return { ok: false, reason: 'not_allowed' };
  }

  const nextEmails = { ...(household.memberEmails ?? {}) };
  delete nextEmails[input.memberId];

  return {
    ok: true,
    household: {
      ...household,
      members: household.members.filter((id) => id !== input.memberId),
      memberEmails: nextEmails,
    },
  };
}

export function removeHouseholdMemberMessage(
  reason: Exclude<RemoveHouseholdMemberResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'not_member':
      return 'Diese Person gehört nicht zum Haushalt.';
    case 'not_allowed':
      return 'Nur der Inhaber darf andere entfernen.';
    case 'cannot_remove_owner':
      return 'Den Inhaber kann man nicht entfernen.';
  }
}

export function inviteHouseholdMessage(
  reason: Exclude<InviteToHouseholdResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'not_owner':
      return 'Nur wer den Haushalt angelegt hat, darf einladen.';
    case 'email_required':
      return 'Bitte eine E-Mail eingeben.';
    case 'email_invalid':
      return 'Bitte eine gültige E-Mail eingeben.';
    case 'already_invited':
      return 'Diese E-Mail ist schon eingeladen.';
    case 'limit_reached':
      return 'Free-Tier: der Haushalt ist voll (max. 2).';
  }
}

export function inviteChangeMessage(
  reason: Exclude<InviteChangeResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'not_owner':
      return 'Nur wer den Haushalt angelegt hat, darf einladen.';
    case 'email_required':
      return 'Bitte eine E-Mail eingeben.';
    case 'email_invalid':
      return 'Bitte eine gültige E-Mail eingeben.';
    case 'already_invited':
      return 'Diese E-Mail ist schon eingeladen.';
    case 'not_invited':
      return 'Diese E-Mail steht nicht auf der Liste.';
  }
}

export function joinHouseholdMessage(
  reason: Exclude<JoinHouseholdResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'invalid_pin':
      return 'PIN stimmt nicht.';
    case 'email_not_invited':
      return 'Diese E-Mail ist nicht eingeladen.';
    case 'already_member':
      return 'Du gehörst schon zu diesem Haushalt.';
    case 'limit_reached':
      return 'Free-Tier: der Haushalt ist voll (max. 2).';
  }
}
