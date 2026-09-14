import { describe, expect, it } from 'vitest';
import {
  ensureMemberEmail,
  householdForJoinPin,
  householdMemberLabel,
  householdMembers,
  inviteToHousehold,
  joinHousehold,
  removeHouseholdMember,
  startHousehold,
  updateInvitedEmail,
  withdrawInvite,
} from './membership';
import type { Household } from '../types';

function householdOf(overrides: Partial<Household> = {}): Household {
  return {
    id: 'hh_1',
    ...startHousehold({
      name: 'Unser Haushalt',
      ownerId: 'user_julian',
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
    }),
    ...overrides,
  };
}

describe('startHousehold', () => {
  it('creates a free household with the owner as the only member', () => {
    expect(
      startHousehold({
        name: 'Unser Haushalt',
        ownerId: 'user_julian',
        createdAt: '2026-09-13T12:00:00.000Z',
        invitePin: '123456',
      }),
    ).toEqual({
      name: 'Unser Haushalt',
      plan: 'free',
      ownerId: 'user_julian',
      members: ['user_julian'],
      createdAt: '2026-09-13T12:00:00.000Z',
      invitePin: '123456',
      invitedEmails: [],
      memberEmails: {},
    });
  });

  it('stores the owner email when provided', () => {
    expect(
      startHousehold({
        name: 'Unser Haushalt',
        ownerId: 'user_julian',
        ownerEmail: ' Julian@Home.de ',
        createdAt: '2026-09-13T12:00:00.000Z',
        invitePin: '123456',
      }).memberEmails,
    ).toEqual({ user_julian: 'julian@home.de' });
  });

  it('rejects a blank household name', () => {
    expect(() =>
      startHousehold({
        name: '   ',
        ownerId: 'user_julian',
        createdAt: '2026-09-13T12:00:00.000Z',
        invitePin: '123456',
      }),
    ).toThrow('household_name_required');
  });
});

describe('inviteToHousehold', () => {
  const household = householdOf();

  it('lets the owner whitelist a trimmed email', () => {
    const result = inviteToHousehold(household, {
      actorId: 'user_julian',
      email: ' Sophie@Home.de ',
    });

    expect(result).toEqual({
      ok: true,
      household: {
        ...household,
        invitedEmails: ['sophie@home.de'],
      },
    });
  });

  it('replaces the pending free-tier invite when the email changes', () => {
    const pending = householdOf({ invitedEmails: ['old@home.de'] });
    const result = inviteToHousehold(pending, {
      actorId: 'user_julian',
      email: 'sophie@home.de',
    });

    expect(result).toEqual({
      ok: true,
      household: {
        ...pending,
        invitedEmails: ['sophie@home.de'],
      },
    });
  });

  it('rejects an invite from someone who is not the owner', () => {
    expect(
      inviteToHousehold(household, { actorId: 'user_sophie', email: 'sophie@home.de' }),
    ).toEqual({ ok: false, reason: 'not_owner' });
  });

  it('rejects a household that is already full', () => {
    const full = householdOf({
      members: ['user_julian', 'user_sophie'],
    });
    expect(
      inviteToHousehold(full, { actorId: 'user_julian', email: 'third@home.de' }),
    ).toEqual({ ok: false, reason: 'limit_reached' });
  });
});

describe('joinHousehold', () => {
  const invited = householdOf({ invitedEmails: ['sophie@home.de'] });

  it('adds the invited email when pin and account match', () => {
    const result = joinHousehold(invited, {
      userId: 'user_sophie',
      email: 'Sophie@Home.de',
      pin: '123456',
    });

    expect(result).toEqual({
      ok: true,
      household: {
        ...invited,
        members: ['user_julian', 'user_sophie'],
        invitedEmails: [],
        memberEmails: { user_sophie: 'sophie@home.de' },
      },
    });
  });

  it('rejects a wrong pin even if the email is invited', () => {
    expect(
      joinHousehold(invited, {
        userId: 'user_sophie',
        email: 'sophie@home.de',
        pin: '000000',
      }),
    ).toEqual({ ok: false, reason: 'invalid_pin' });
  });

  it('rejects a matching pin when the account email is not invited', () => {
    expect(
      joinHousehold(invited, {
        userId: 'user_other',
        email: 'other@home.de',
        pin: '123456',
      }),
    ).toEqual({ ok: false, reason: 'email_not_invited' });
  });

  it('rejects a third member on the free plan', () => {
    const joined = joinHousehold(invited, {
      userId: 'user_sophie',
      email: 'sophie@home.de',
      pin: '123456',
    });
    if (!joined.ok) {
      throw new Error('expected join to succeed');
    }

    expect(
      joinHousehold(
        { ...joined.household, invitedEmails: ['third@home.de'] },
        { userId: 'user_third', email: 'third@home.de', pin: '123456' },
      ),
    ).toEqual({ ok: false, reason: 'limit_reached' });
  });

  it('rejects a user who is already a member', () => {
    expect(
      joinHousehold(invited, {
        userId: 'user_julian',
        email: 'sophie@home.de',
        pin: '123456',
      }),
    ).toEqual({ ok: false, reason: 'already_member' });
  });
});

describe('householdForJoinPin', () => {
  it('picks the invited household whose pin matches', () => {
    const sophie = householdOf({ id: 'hh_sophie', invitePin: '123456' });
    const other = householdOf({ id: 'hh_other', invitePin: '999999' });
    expect(householdForJoinPin([other, sophie], '123456')).toEqual(sophie);
  });

  it('returns null when no invited household has that pin', () => {
    expect(householdForJoinPin([householdOf()], '000000')).toBeNull();
  });
});

describe('withdrawInvite', () => {
  it('lets the owner remove an invited email', () => {
    const pending = householdOf({ invitedEmails: ['sophie@home.de'] });
    expect(
      withdrawInvite(pending, { actorId: 'user_julian', email: 'Sophie@Home.de' }),
    ).toEqual({
      ok: true,
      household: { ...pending, invitedEmails: [] },
    });
  });

  it('rejects removing an email that is not on the list', () => {
    expect(
      withdrawInvite(householdOf(), { actorId: 'user_julian', email: 'sophie@home.de' }),
    ).toEqual({ ok: false, reason: 'not_invited' });
  });
});

describe('updateInvitedEmail', () => {
  it('lets the owner replace an invited email', () => {
    const pending = householdOf({ invitedEmails: ['old@home.de'] });
    expect(
      updateInvitedEmail(pending, {
        actorId: 'user_julian',
        fromEmail: 'old@home.de',
        toEmail: 'sophie@home.de',
      }),
    ).toEqual({
      ok: true,
      household: { ...pending, invitedEmails: ['sophie@home.de'] },
    });
  });
});

describe('householdMembers', () => {
  it('labels the owner and uses stored emails', () => {
    const household = householdOf({
      members: ['user_julian', 'user_sophie'],
      memberEmails: {
        user_julian: 'julian@home.de',
        user_sophie: 'sophie@home.de',
      },
    });
    expect(householdMembers(household)).toEqual([
      { userId: 'user_julian', email: 'julian@home.de', role: 'owner' },
      { userId: 'user_sophie', email: 'sophie@home.de', role: 'member' },
    ]);
  });

  it('does not fall back to the word Mitglied when the email is missing', () => {
    expect(householdMemberLabel(null)).toBe('E-Mail unbekannt');
    expect(householdMemberLabel('sophie@home.de')).toBe('sophie@home.de');
  });
});

describe('ensureMemberEmail', () => {
  it('fills a missing member email without overwriting one that is already stored', () => {
    const household = householdOf({
      members: ['user_julian', 'user_sophie'],
      memberEmails: { user_julian: 'julian@home.de' },
    });
    expect(
      ensureMemberEmail(household, { userId: 'user_sophie', email: ' Sophie@Home.de ' }).memberEmails,
    ).toEqual({
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    });
    expect(
      ensureMemberEmail(household, { userId: 'user_julian', email: 'other@home.de' }).memberEmails,
    ).toEqual({ user_julian: 'julian@home.de' });
  });

  it('ignores people who are not members', () => {
    const household = householdOf();
    expect(ensureMemberEmail(household, { userId: 'user_other', email: 'other@home.de' })).toEqual(
      household,
    );
  });
});

describe('removeHouseholdMember', () => {
  const full = householdOf({
    members: ['user_julian', 'user_sophie'],
    memberEmails: {
      user_julian: 'julian@home.de',
      user_sophie: 'sophie@home.de',
    },
  });

  it('lets the owner remove a member and frees the free-tier slot', () => {
    const result = removeHouseholdMember(full, {
      actorId: 'user_julian',
      memberId: 'user_sophie',
    });
    expect(result).toEqual({
      ok: true,
      household: {
        ...full,
        members: ['user_julian'],
        memberEmails: { user_julian: 'julian@home.de' },
      },
    });
    if (!result.ok) {
      throw new Error('expected remove to succeed');
    }
    expect(
      inviteToHousehold(result.household, { actorId: 'user_julian', email: 'new@home.de' }),
    ).toMatchObject({ ok: true });
  });

  it('lets a member leave', () => {
    expect(
      removeHouseholdMember(full, { actorId: 'user_sophie', memberId: 'user_sophie' }),
    ).toEqual({
      ok: true,
      household: {
        ...full,
        members: ['user_julian'],
        memberEmails: { user_julian: 'julian@home.de' },
      },
    });
  });

  it('rejects removing the owner', () => {
    expect(
      removeHouseholdMember(full, { actorId: 'user_julian', memberId: 'user_julian' }),
    ).toEqual({ ok: false, reason: 'cannot_remove_owner' });
    expect(
      removeHouseholdMember(full, { actorId: 'user_sophie', memberId: 'user_julian' }),
    ).toEqual({ ok: false, reason: 'cannot_remove_owner' });
  });

  it('rejects a member kicking someone else', () => {
    const pro = householdOf({
      plan: 'pro',
      members: ['user_julian', 'user_sophie', 'user_third'],
      memberEmails: {
        user_julian: 'julian@home.de',
        user_sophie: 'sophie@home.de',
        user_third: 'third@home.de',
      },
    });
    expect(
      removeHouseholdMember(pro, { actorId: 'user_sophie', memberId: 'user_third' }),
    ).toEqual({ ok: false, reason: 'not_allowed' });
  });

  it('rejects a stranger removing a member', () => {
    expect(
      removeHouseholdMember(full, { actorId: 'user_other', memberId: 'user_sophie' }),
    ).toEqual({ ok: false, reason: 'not_allowed' });
  });
});
