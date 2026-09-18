import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTheme } from '../lib/theme';

export function HeuteSettingsButton() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Einstellungen"
      hitSlop={8}
      onPress={() => router.push('/einstellungen')}
      style={{ marginRight: 12 }}
    >
      <Ionicons name="settings-outline" size={22} color={theme.inkSoft} />
    </Pressable>
  );
}
