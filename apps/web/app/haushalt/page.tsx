'use client';

import type { Household } from '@family-companion/shared';
import {
  ensureMemberEmail,
  householdMemberLabel,
  householdMembers,
  messageFromStoreError,
  removeHouseholdMember,
  removeHouseholdMemberMessage,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';

export default function HaushaltPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      const withEmail = ensureMemberEmail(found, {
        userId: user.uid,
        email: user.email ?? '',
      });
      if (withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]) {
        try {
          await households.saveHousehold(withEmail);
          setHousehold(withEmail);
        } catch (err) {
          console.error('[member email]', err);
          setHousehold(found);
        }
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  async function removeMember(memberId: string, label: string) {
    if (!household || !uid) {
      return;
    }
    const leaving = memberId === uid;
    const ok = window.confirm(
      leaving
        ? 'Wirklich aus dem Haushalt austreten?'
        : `${label} aus dem Haushalt entfernen?`,
    );
    if (!ok) {
      return;
    }
    const result = removeHouseholdMember(household, { actorId: uid, memberId });
    if (!result.ok) {
      setError(removeHouseholdMemberMessage(result.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(result.household);
      if (leaving) {
        router.replace('/onboarding');
        return;
      }
      setHousehold(result.household);
    } catch (err) {
      console.error('[member remove]', err);
      setError(messageFromStoreError(err, 'Mitglied konnte nicht entfernt werden.'));
    } finally {
      setBusy(false);
    }
  }

  if (!household || !uid) {
    return (
      <Chrome crumb="Haushalt">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  const isOwner = uid === (household.ownerId ?? household.members[0]);
  const invitedEmails = household.invitedEmails ?? [];
  const members = householdMembers(household);

  return (
    <Chrome crumb="Haushalt" current="haushalt">
      <div className="cards">
        <article className="card stack">
          <h1>{household.name}</h1>
          <hr className="rule" />
          <p className="muted">
            Plan {household.plan} · {household.members.length} Mitglieder
          </p>
          <h2>Mitglieder</h2>
          {error ? (
            <p className="err" role="alert">
              {error}
            </p>
          ) : null}
          <ul className="plain-list">
            {members.map((member) => {
              const emailLabel = householdMemberLabel(member.email);
              const canKick = isOwner && member.role !== 'owner';
              const canLeave = member.userId === uid && member.role !== 'owner';
              return (
                <li className="invite-row" key={member.userId}>
                  <p>
                    {emailLabel}
                    {member.role === 'owner' ? ' · Inhaber' : ''}
                    {member.userId === uid ? ' · du' : ''}
                  </p>
                  {canKick || canLeave ? (
                    <div className="row-actions">
                      <button
                        className="btn ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => void removeMember(member.userId, emailLabel)}
                      >
                        {canLeave ? 'Austreten' : 'Entfernen'}
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </article>
        <article className="card stack">
          <h2>Einladungen</h2>
          <hr className="rule" />
          <p className="muted">
            {invitedEmails.length === 0
              ? 'Keine offene Einladung.'
              : `${invitedEmails.length} offen · PIN ${household.invitePin ?? '—'}`}
          </p>
          {isOwner ? (
            <Link className="text-link" href="/haushalt/einladen">
              Einladungen verwalten
            </Link>
          ) : (
            <p className="muted">Einladen kann nur, wer den Haushalt angelegt hat.</p>
          )}
        </article>
      </div>
    </Chrome>
  );
}
