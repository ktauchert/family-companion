'use client';

import type { Household } from '@family-companion/shared';
import {
  inviteChangeMessage,
  inviteHouseholdMessage,
  inviteToHousehold,
  messageFromStoreError,
  updateInvitedEmail,
  withdrawInvite,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Chrome } from '../../../components/Chrome';
import { auth } from '../../../lib/firebase';
import { households } from '../../../lib/households';

export default function EinladenPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
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
      if (user.uid !== (found.ownerId ?? found.members[0])) {
        router.replace('/haushalt');
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  async function persist(next: Household) {
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(next);
      setHousehold(next);
      setEmail('');
      setEditing(null);
    } catch (err) {
      console.error('[invite save]', err);
      setError(messageFromStoreError(err, 'Einladung konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!household || !uid) {
      return;
    }
    const result = inviteToHousehold(household, { actorId: uid, email });
    if (!result.ok) {
      setError(inviteHouseholdMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  async function remove(invited: string) {
    if (!household || !uid) {
      return;
    }
    const result = withdrawInvite(household, { actorId: uid, email: invited });
    if (!result.ok) {
      setError(inviteChangeMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  async function saveEdit(fromEmail: string) {
    if (!household || !uid) {
      return;
    }
    const result = updateInvitedEmail(household, {
      actorId: uid,
      fromEmail,
      toEmail: editValue,
    });
    if (!result.ok) {
      setError(inviteChangeMessage(result.reason));
      return;
    }
    await persist(result.household);
  }

  if (!household || !uid) {
    return (
      <Chrome crumb="Haushalt / Einladen" current="haushalt">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  const invitePin = household.invitePin ?? '';
  const invitedEmails = household.invitedEmails ?? [];

  return (
    <Chrome crumb="Haushalt / Einladen" current="haushalt">
      <article className="card stack">
        <h1>Einladungen</h1>
        <hr className="rule" />
        <p className="muted">
          PIN: <code>{invitePin || '—'}</code>
        </p>
        {invitePin ? (
          <button
            className="btn ghost"
            type="button"
            onClick={() => void navigator.clipboard.writeText(invitePin)}
          >
            PIN kopieren
          </button>
        ) : null}
        {error ? (
          <p className="err" role="alert">
            {error}
          </p>
        ) : null}
        {invitedEmails.length === 0 ? (
          <p className="muted">Noch niemand eingeladen.</p>
        ) : (
          invitedEmails.map((invited) => (
            <div className="invite-row" key={invited}>
              {editing === invited ? (
                <>
                  <label className="field" htmlFor={`edit-${invited}`}>
                    E-Mail ändern
                    <input
                      id={`edit-${invited}`}
                      type="email"
                      value={editValue}
                      disabled={busy}
                      onChange={(event) => setEditValue(event.target.value)}
                    />
                  </label>
                  <div className="row-actions">
                    <button
                      className="btn"
                      type="button"
                      disabled={busy}
                      onClick={() => void saveEdit(invited)}
                    >
                      Speichern
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      disabled={busy}
                      onClick={() => setEditing(null)}
                    >
                      Abbrechen
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {invited} · PIN {invitePin}
                  </p>
                  <div className="row-actions">
                    <button
                      className="btn ghost"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditing(invited);
                        setEditValue(invited);
                      }}
                    >
                      Ändern
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(invited)}
                    >
                      Entfernen
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <form className="stack" onSubmit={(event) => void add(event)}>
          <label className="field" htmlFor="invite-email">
            E-Mail einladen
            <input
              id="invite-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Bitte warten…' : 'Auf die Liste setzen'}
          </button>
        </form>
        <Link className="text-link" href="/haushalt">
          Zurück zum Haushalt
        </Link>
      </article>
    </Chrome>
  );
}
