'use client';

import {
  emailPasswordReasonMessage,
  messageFromAuthError,
  parseEmailPassword,
} from '@family-companion/shared';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { pathAfterAuth } from '../../lib/after-auth';
import { auth } from '../../lib/firebase';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const loginHref = nextParam
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : '/login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      void pathAfterAuth(user.uid, nextParam).then((href) => {
        router.replace(href);
      });
    });
  }, [nextParam, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseEmailPassword({ email, password, confirmPassword });
    if (!parsed.ok) {
      setError(emailPasswordReasonMessage(parsed.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        parsed.email,
        parsed.password,
      );
      router.replace(await pathAfterAuth(cred.user.uid, nextParam));
    } catch (err) {
      setError(messageFromAuthError(err, 'register'));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="wrap">
        <p className="muted">Laden…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <form className="card stack" onSubmit={onSubmit}>
        <h1>Registrieren</h1>
        <hr className="rule" />
        <p className="muted">Neues Konto mit E-Mail und Passwort (mindestens 6 Zeichen).</p>
        {error ? (
          <p className="err" role="alert">
            {error}
          </p>
        ) : null}
        <label className="field" htmlFor="register-email">
          E-Mail
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field" htmlFor="register-password">
          Passwort
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            disabled={busy}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="field" htmlFor="register-confirm">
          Passwort wiederholen
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            disabled={busy}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Bitte warten…' : 'Konto erstellen'}
        </button>
        <Link className="text-link" href={loginHref}>
          Schon ein Konto? Anmelden
        </Link>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <p className="muted">Laden…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
