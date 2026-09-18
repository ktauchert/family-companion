'use client';

import type { Household } from '@family-companion/shared';
import {
  messageFromStoreError,
  upgradeHouseholdPlanMessage,
  upgradeHouseholdToPro,
} from '@family-companion/shared';
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
import { households } from '../../../lib/households';

export default function EinstellungenPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme(readThemePreference());
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setEmail(user.email ?? '—');
      setUid(user.uid);
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  function selectTheme(next: ThemePreference) {
    setTheme(next);
    writeThemePreference(next);
  }

  async function activateFamilyPlus() {
    if (!household || !uid) {
      return;
    }
    const result = upgradeHouseholdToPro(household, { actorId: uid });
    if (!result.ok) {
      setError(upgradeHouseholdPlanMessage(result.reason));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(result.household);
      setHousehold(result.household);
    } catch (err) {
      console.error('[upgrade plan]', err);
      setError(messageFromStoreError(err, 'Family+ konnte nicht aktiviert werden.'));
    } finally {
      setBusy(false);
    }
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

  if (!email || !household || !uid) {
    return (
      <Chrome crumb="Einstellungen">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  const isOwner = uid === (household.ownerId ?? household.members[0]);
  const isPro = household.plan === 'pro';

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
              <span className="settings-row-value">
                {isPro ? (
                  <span className="stamp pro-teaser-stamp">Aktiv</span>
                ) : isOwner ? (
                  <button
                    className="btn"
                    type="button"
                    disabled={busy}
                    onClick={() => void activateFamilyPlus()}
                  >
                    {busy ? 'Bitte warten…' : 'Aktivieren'}
                  </button>
                ) : (
                  <span className="muted">Nur der Inhaber kann aktivieren.</span>
                )}
              </span>
            </div>
            {error ? (
              <p className="err" role="alert">
                {error}
              </p>
            ) : null}
            {!isPro && isOwner ? (
              <p className="muted small">
                Mehr Mitglieder, KI-Tagesplan, Per-Member-Habits und Smart Shopping — ohne
                Zahlungsanbieter in dieser Phase.
              </p>
            ) : null}
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
