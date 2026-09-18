import {
  NAV_AREA_KEYS,
  NAV_ICON_TO_MOBILE_TAB,
  navAreaMobileTabLabel,
} from '@family-companion/shared';
import { Tabs } from 'expo-router';
import { navAreaTabIcon } from '../../components/nav-icons';
import { HeuteSettingsButton } from '../../components/HeuteSettingsButton';
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
      {NAV_AREA_KEYS.map((key) => {
        const tabName = NAV_ICON_TO_MOBILE_TAB[key];
        return (
          <Tabs.Screen
            key={tabName}
            name={tabName}
            options={{
              title: navAreaMobileTabLabel(key),
              tabBarIcon: navAreaTabIcon(key),
              ...(tabName === 'heute'
                ? { headerRight: () => <HeuteSettingsButton /> }
                : {}),
            }}
          />
        );
      })}
    </Tabs>
  );
}
