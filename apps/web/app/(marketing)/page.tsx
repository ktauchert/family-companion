'use client';

import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NavAreaIcon } from '../../components/icons';
import { auth } from '../../lib/firebase';

const FEATURES = [
  {
    icon: 'listen' as const,
    title: 'Listen',
    text: 'Gemeinsam abhaken — Supermarkt, Drogerie und mehr.',
  },
  {
    icon: 'kalender' as const,
    title: 'Kalender & Todos',
    text: 'Termine und Aufgaben im Blick, wer was übernimmt.',
  },
  {
    icon: 'heute' as const,
    title: 'Heute',
    text: 'Morgen-Check-in und priorisierter Überblick für den Tag.',
  },
];

export default function LandingPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setSignedIn(user !== null);
    });
  }, []);

  return (
    <>
      <section className="landing-hero wrap">
        <h1>Family Companion</h1>
        <p className="landing-lead">
          Listen, Termine und Todos für euren Haushalt — übersichtlich und gemeinsam.
        </p>
        <div className="landing-cta-row">
          {signedIn === null ? null : signedIn ? (
            <Link className="btn" href="/heute">
              Zur App
            </Link>
          ) : (
            <>
              <Link className="btn" href="/register">
                Kostenlos starten
              </Link>
              <Link className="btn ghost" href="/login">
                Anmelden
              </Link>
            </>
          )}
        </div>
      </section>
      <section className="landing-features wrap" aria-label="Überblick">
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.icon} className="card landing-feature-card">
              <div className="landing-feature-head">
                <NavAreaIcon icon={feature.icon} size={22} title={feature.title} />
                <h2>{feature.title}</h2>
              </div>
              <p className="muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
