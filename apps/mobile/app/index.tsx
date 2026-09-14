import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { auth } from '../lib/firebase';
import { households } from '../lib/households';
import { useTheme } from '../lib/theme';

export default function IndexScreen() {
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      const household = await households.householdForUser(user.uid);
      router.replace(household ? '/heute' : '/onboarding');
    });
  }, [router]);

  return (
    <View style={[styles.page, { backgroundColor: theme.paper }]}>
      <Text style={{ color: theme.inkSoft }}>Laden…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
});
