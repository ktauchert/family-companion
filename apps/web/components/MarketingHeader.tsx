'use client';

import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

export function MarketingHeader() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setSignedIn(user !== null);
    });
  }, []);

  return (
    <header className="marketing-top">
      <Link href="/" className="serif marketing-wordmark">
        Family Companion
      </Link>
      <div className="marketing-top-actions">
        {signedIn === null ? (
          <span className="muted marketing-top-placeholder" aria-hidden="true">
            &nbsp;
          </span>
        ) : signedIn ? (
          <Link className="btn" href="/heute">
            Zur App
          </Link>
        ) : (
          <>
            <Link className="btn ghost" href="/login">
              Anmelden
            </Link>
            <Link className="btn" href="/register">
              Registrieren
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
