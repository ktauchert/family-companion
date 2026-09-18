'use client';

import {
  THEME_PREFERENCE_LABELS,
  type ThemePreference,
  readThemePreference,
  writeThemePreference,
} from '../../../lib/theme';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chrome } from '../../../components/Chrome';
import { auth } from '../../../lib/firebase';

export default function EinstellungenPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTheme(readThemePreference());
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setEmail(user.email ?? '—');
    });
  }, [router]);

  function selectTheme(next: ThemePreference) {
    setTheme(next);
    writeThemePreference(next);
  }

  async function logout() {
    setBusy(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } finally {
      setBusy(false);
    }
  }

  if (!email) {
    return (
      <Chrome crumb="Einstellungen">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb="Einstellungen">
      <div className="cards">
        <article className="card stack">
          <h1>Einstellungen</h1>
          <hr className="rule" />
          <div className="settings-list">
            <div className="settings-row">
              <span className="settings-row-label">Konto</span>
              <span className="settings-row-value">{email}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Darstellung</span>
              <div className="settings-chip-row" role="group" aria-label="Theme">
                {(['system', 'light', 'dark'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`chip${theme === option ? ' selected' : ''}`}
                    onClick={() => selectTheme(option)}
                  >
                    {THEME_PREFERENCE_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Family+</span>
              <span className="muted">Kommt bald</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Rechtliches</span>
              <span className="row-actions">
                <Link className="text-link" href="/impressum">
                  Impressum
                </Link>
                <Link className="text-link" href="/datenschutz">
                  Datenschutz
                </Link>
              </span>
            </div>
            <div className="settings-row">
              <button className="btn ghost" type="button" disabled={busy} onClick={() => void logout()}>
                Abmelden
              </button>
            </div>
          </div>
        </article>
      </div>
    </Chrome>
  );
}
