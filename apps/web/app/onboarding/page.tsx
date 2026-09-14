'use client';

import {
  householdForJoinPin,
  invitePinReasonMessage,
  joinHousehold,
  joinHouseholdMessage,
  messageFromStoreError,
  newInvitePin,
  parseEmailAddress,
  parseInvitePin,
  startHousehold,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('Unser Haushalt');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      setEmail(user.email);
      const existing = await households.householdForUser(user.uid);
      if (existing) {
        router.replace('/heute');
      }
    });
  }, [router]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const draft = startHousehold({
        name,
        ownerId: uid,
        ownerEmail: email ?? undefined,
        createdAt: new Date().toISOString(),
        invitePin: newInvitePin(),
      });
      await households.createHousehold(draft);
      router.replace('/heute');
    } catch (err) {
      console.error('[onboarding create]', err);
      setError(
        err instanceof Error && err.message === 'household_name_required'
          ? 'Bitte einen Haushaltsnamen eingeben.'
          : messageFromStoreError(err, 'Haushalt konnte nicht angelegt werden.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uid) {
      return;
    }
    const parsedEmail = parseEmailAddress(email ?? '');
    if (!parsedEmail.ok) {
      setError('Dieses Konto hat keine gültige E-Mail. Bitte mit E-Mail anmelden.');
      return;
    }
    const parsedPin = parseInvitePin(pin);
    if (!parsedPin.ok) {
      setError(invitePinReasonMessage(parsedPin.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const invited = await households.householdsForInvitedEmail(parsedEmail.email);
      const found = householdForJoinPin(invited, parsedPin.pin);
      if (!found) {
        setError(
          invited.length === 0
            ? joinHouseholdMessage('email_not_invited')
            : joinHouseholdMessage('invalid_pin'),
        );
        return;
      }
      const result = joinHousehold(found, {
        userId: uid,
        email: parsedEmail.email,
        pin: parsedPin.pin,
      });
      if (!result.ok) {
        setError(joinHouseholdMessage(result.reason));
        return;
      }
      await households.saveHousehold(result.household);
      router.replace('/heute');
    } catch (err) {
      console.error('[onboarding join]', err);
      setError(messageFromStoreError(err, 'Beitritt nicht möglich.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Chrome crumb="Haushalt / Anlegen">
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
      <article className="card stack">
        <h1>Mit PIN beitreten</h1>
        <hr className="rule" />
        <p className="muted">
          Nur PIN. Der Haushaltsname wird nicht gebraucht. Die E-Mail des Kontos muss auf der Liste stehen.
        </p>
        <form className="stack" onSubmit={(event) => void join(event)}>
          <label className="field" htmlFor="household-pin">
            PIN
            <input
              id="household-pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              disabled={busy}
              onChange={(event) => setPin(event.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Bitte warten…' : 'Beitreten'}
          </button>
        </form>
      </article>
      <article className="card stack" style={{ marginTop: 16 }}>
        <h1>Neuen Haushalt anlegen</h1>
        <hr className="rule" />
        <form className="stack" onSubmit={(event) => void create(event)}>
          <label className="field" htmlFor="household-name">
            Name
            <input
              id="household-name"
              value={name}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button className="btn ghost" type="submit" disabled={busy}>
            {busy ? 'Bitte warten…' : 'Haushalt anlegen'}
          </button>
        </form>
      </article>
    </Chrome>
  );
}
