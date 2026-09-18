'use client';

import { useEffect } from 'react';
import { applyThemePreference, readThemePreference } from '../lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyThemePreference(readThemePreference());
  }, []);

  return children;
}
