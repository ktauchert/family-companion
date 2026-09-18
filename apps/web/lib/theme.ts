export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_PREFERENCE_KEY = 'fc-theme-preference';

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Hell',
  dark: 'Dunkel',
};

export function readThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const stored = window.localStorage.getItem(THEME_PREFERENCE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export function writeThemePreference(preference: ThemePreference): void {
  window.localStorage.setItem(THEME_PREFERENCE_KEY, preference);
  applyThemePreference(preference);
}

export function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute('data-theme');
    return;
  }
  root.setAttribute('data-theme', preference);
}

export function subscribeThemePreference(onChange: (preference: ThemePreference) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === THEME_PREFERENCE_KEY) {
      onChange(readThemePreference());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
