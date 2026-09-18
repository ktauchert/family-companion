'use client';

import {
  emailPasswordReasonMessage,
  messageFromAuthError,
  parseEmailPassword,
} from '@family-companion/shared';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { pathAfterAuth } from '../../../lib/after-auth';
import { auth } from '../../../lib/firebase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const registerHref = nextParam
    ? `/register?next=${encodeURIComponent(nextParam)}`
    : '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  async function continueWith(uid: string) {
    router.replace(await pathAfterAuth(uid, nextParam));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseEmailPassword({ email, password });
    if (!parsed.ok) {
      setError(emailPasswordReasonMessage(parsed.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, parsed.email, parsed.password);
      await continueWith(cred.user.uid);
    } catch (err) {
      setError(messageFromAuthError(err, 'sign-in'));
    } finally {
      setBusy(false);
    }
  }

  async function signInGoogle() {
    setBusy(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await continueWith(result.user.uid);
    } catch (err) {
      setError(messageFromAuthError(err, 'google'));
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
        <h1>Anmelden</h1>
        <hr className="rule" />
        <p className="muted">Mit E-Mail oder Google. Neues Konto über Registrieren.</p>
        {error ? (
          <p className="err" role="alert">
            {error}
          </p>
        ) : null}
        <label className="field" htmlFor="login-email">
          E-Mail
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field" htmlFor="login-password">
          Passwort
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={busy}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Bitte warten…' : 'Anmelden'}
        </button>
        <p className="or">oder</p>
        <button className="btn ghost" type="button" disabled={busy} onClick={() => void signInGoogle()}>
          Mit Google anmelden
        </button>
        <Link className="text-link" href={registerHref}>
          Noch kein Konto? Registrieren
        </Link>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <p className="muted">Laden…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
