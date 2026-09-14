'use client';

import type { Household } from '@family-companion/shared';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';

export default function HeutePage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  if (!household) {
    return (
      <Chrome crumb="Heute">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb="Heute" current="heute">
      <article className="card stack">
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Guten Tag</h1>
          <span className="stamp">{household.plan}</span>
        </header>
        <hr className="rule" />
        <p className="muted">{household.name}</p>
        <p className="muted">{household.members.length} Mitglied(er)</p>
        <button className="btn ghost" type="button" onClick={() => void signOut(auth)}>
          Abmelden
        </button>
      </article>
    </Chrome>
  );
}
