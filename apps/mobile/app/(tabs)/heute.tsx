import type { Household } from '@family-companion/shared';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { useTheme } from '../../lib/theme';

export default function HeuteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      void households.householdForUser(user.uid).then((found) => {
        if (!found) {
          router.replace('/onboarding');
          return;
        }
        setHousehold(found);
      });
    });
  }, [router]);

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.paper,
      padding: 24,
    },
    card: {
      backgroundColor: theme.sheet,
      borderRadius: 20,
      padding: 22,
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontFamily: 'Georgia',
      color: theme.ink,
    },
    stamp: {
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: theme.inkFaint,
    },
    rule: {
      width: 48,
      height: 1,
      backgroundColor: theme.rule,
    },
    muted: {
      color: theme.inkSoft,
    },
    btn: {
      backgroundColor: theme.well,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    btnText: {
      color: theme.ink,
    },
  });

  if (!household) {
    return (
      <View style={styles.page}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Guten Tag</Text>
          <Text style={styles.stamp}>{household.plan}</Text>
        </View>
        <View style={styles.rule} />
        <Text style={styles.muted}>{household.name}</Text>
        <Text style={styles.muted}>{household.members.length} Mitglied(er)</Text>
        <Pressable
          style={styles.btn}
          onPress={() => void signOut(auth).then(() => router.replace('/login'))}
        >
          <Text style={styles.btnText}>Abmelden</Text>
        </Pressable>
      </View>
    </View>
  );
}
