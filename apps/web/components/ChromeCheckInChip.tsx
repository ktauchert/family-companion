'use client';

import type { Household, MorningCheckIn } from '@family-companion/shared';
import { ensureMemberEmail, localDateString } from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';
import { morning } from '../lib/morning';
import { CheckInChip } from './heute/CheckInChip';

export function ChromeCheckInChip() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [checkIns, setCheckIns] = useState<MorningCheckIn[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setHousehold(null);
        setCheckIns([]);
        return;
      }
      void households.householdForUser(user.uid).then((found) => {
        if (!found) {
          setHousehold(null);
          setCheckIns([]);
          return;
        }
        setHousehold(
          ensureMemberEmail(found, { userId: user.uid, email: user.email ?? '' }),
        );
      });
    });
  }, []);

  useEffect(() => {
    if (!household) {
      return;
    }
    const today = localDateString();
    return morning.subscribeForHouseholdOnDate(household.id, today, setCheckIns);
  }, [household]);

  if (!household || checkIns.length === 0) {
    return null;
  }

  return <CheckInChip checkIns={checkIns} household={household} />;
}
