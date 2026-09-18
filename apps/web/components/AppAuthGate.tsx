'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

function AppAuthGateInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        const query = searchParams.toString();
        const next = query ? `${pathname}?${query}` : pathname;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setReady(true);
    });
  }, [pathname, router, searchParams]);

  if (!ready) {
    return (
      <div className="wrap">
        <p className="muted">Laden…</p>
      </div>
    );
  }

  return children;
}

export function AppAuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <p className="muted">Laden…</p>
        </div>
      }
    >
      <AppAuthGateInner>{children}</AppAuthGateInner>
    </Suspense>
  );
}
