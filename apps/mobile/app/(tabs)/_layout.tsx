import { Tabs } from 'expo-router';
import { useTheme } from '../../lib/theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.sheet },
        headerTitleStyle: { color: theme.ink, fontFamily: 'Georgia' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.well,
          borderTopColor: theme.rule,
        },
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.inkFaint,
      }}
    >
      <Tabs.Screen name="heute" options={{ title: 'Heute' }} />
      <Tabs.Screen name="kalender" options={{ title: 'Kalender' }} />
      <Tabs.Screen name="todos" options={{ title: 'Todos' }} />
      <Tabs.Screen name="listen" options={{ title: 'Listen' }} />
      <Tabs.Screen name="mehr" options={{ title: 'Mehr' }} />
    </Tabs>
  );
}
