import { useMemo } from 'react';
import { useTheme } from './theme';

export function useStackScreenOptions(title: string) {
  const theme = useTheme();

  return useMemo(
    () => ({
      headerShown: true,
      title,
      headerStyle: { backgroundColor: theme.sheet },
      headerTitleStyle: { color: theme.ink, fontFamily: 'Georgia' },
      headerShadowVisible: false,
      headerTintColor: theme.inkSoft,
    }),
    [theme, title],
  );
}
