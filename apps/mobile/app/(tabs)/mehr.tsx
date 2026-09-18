import type { Household } from '@family-companion/shared';
import {
  ensureMemberEmail,
  householdMembers,
  messageFromStoreError,
  removeHouseholdMember,
  removeHouseholdMemberMessage,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MemberRow } from '../../components/haushalt/MemberRow';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { useTheme } from '../../lib/theme';

export default function MehrScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      void households.householdForUser(user.uid).then(async (found) => {
        if (!found) {
          router.replace('/onboarding');
          return;
        }
        const withEmail = ensureMemberEmail(found, {
          userId: user.uid,
          email: user.email ?? '',
        });
        if (withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]) {
          try {
            await households.saveHousehold(withEmail);
            setHousehold(withEmail);
          } catch (err) {
            console.error('[member email]', err);
            setHousehold(found);
          }
          return;
        }
        setHousehold(found);
      });
    });
  }, [router]);

  async function persistRemoval(next: Household, leaving: boolean) {
    setBusy(true);
    setError(null);
    try {
      await households.saveHousehold(next);
      if (leaving) {
        router.replace('/onboarding');
        return;
      }
      setHousehold(next);
    } catch (err) {
      console.error('[member remove]', err);
      setError(messageFromStoreError(err, 'Mitglied konnte nicht entfernt werden.'));
    } finally {
      setBusy(false);
    }
  }

  function removeMember(memberId: string, label: string) {
    if (!household || !uid) {
      return;
    }
    const leaving = memberId === uid;
    Alert.alert(
      leaving ? 'Austreten' : 'Entfernen',
      leaving
        ? 'Wirklich aus dem Haushalt austreten?'
        : `${label} aus dem Haushalt entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: leaving ? 'Austreten' : 'Entfernen',
          style: 'destructive',
          onPress: () => {
            const result = removeHouseholdMember(household, { actorId: uid, memberId });
            if (!result.ok) {
              setError(removeHouseholdMemberMessage(result.reason));
              return;
            }
            void persistRemoval(result.household, leaving);
          },
        },
      ],
    );
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.paper,
    },
    content: {
      padding: 24,
      gap: 16,
    },
    card: {
      backgroundColor: theme.sheet,
      borderRadius: 20,
      padding: 22,
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Georgia',
      color: theme.ink,
    },
    heading: {
      fontSize: 20,
      fontFamily: 'Georgia',
      color: theme.ink,
    },
    rule: {
      width: 48,
      height: 1,
      backgroundColor: theme.rule,
    },
    muted: {
      color: theme.inkSoft,
    },
    err: {
      color: theme.rust,
    },
    link: {
      color: theme.inkSoft,
      fontSize: 15,
    },
  });

  if (!household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  const isOwner = uid === (household.ownerId ?? household.members[0]);
  const invitedEmails = household.invitedEmails ?? [];
  const members = householdMembers(household);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{household.name}</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>
          Plan {household.plan} · {household.members.length} Mitglieder
        </Text>
        <Text style={styles.heading}>Mitglieder</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            actorId={uid}
            isOwner={isOwner}
            busy={busy}
            onRemove={removeMember}
          />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Einladungen</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>
          {invitedEmails.length === 0
            ? 'Keine offene Einladung.'
            : `${invitedEmails.length} offen · PIN ${household.invitePin ?? '—'}`}
        </Text>
        {isOwner ? (
          <Link href="/einladen" style={styles.link}>
            Einladungen verwalten
          </Link>
        ) : (
          <Text style={styles.muted}>Einladen kann nur, wer den Haushalt angelegt hat.</Text>
        )}
      </View>
    </ScrollView>
  );
}
