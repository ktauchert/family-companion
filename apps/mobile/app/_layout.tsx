import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemePreferenceProvider } from '../lib/theme';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemePreferenceProvider>
  );
}
