'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const household = await households.householdForUser(user.uid);
      router.replace(household ? '/heute' : '/onboarding');
    });
  }, [router]);

  return (
    <div className="wrap">
      <p className="muted">Laden…</p>
    </div>
  );
}
