import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_PREFERENCE_KEY = 'fc-theme-preference';

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Hell',
  dark: 'Dunkel',
};

const paper = {
  paper: '#F1EBE0',
  sheet: '#F7F2E8',
  well: '#E6DFD2',
  ink: '#2B261F',
  inkSoft: '#5E574C',
  inkFaint: '#8A8274',
  rule: '#D3C9B8',
  sage: '#6E7F6A',
  clay: '#B08968',
  rust: '#9A5B4A',
};

const stone = {
  paper: '#24211E',
  sheet: '#2F2B27',
  well: '#1A1816',
  ink: '#E6DFD2',
  inkSoft: '#B2A99A',
  inkFaint: '#7A7368',
  rule: '#454039',
  sage: '#9AA890',
  clay: '#C4A27A',
  rust: '#C48978',
};

export type AppTheme = typeof paper;

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  theme: AppTheme;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((stored) => {
      if (isThemePreference(stored)) {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, next);
  }, []);

  const effectiveScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const theme = effectiveScheme === 'dark' ? stone : paper;

  const value = useMemo(
    () => ({ preference, setPreference, theme }),
    [preference, setPreference, theme],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useTheme(): AppTheme {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    return paper;
  }
  return context.theme;
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference requires ThemePreferenceProvider');
  }
  return context;
}
