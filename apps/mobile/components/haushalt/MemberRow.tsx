import { householdMemberLabel } from '@family-companion/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ItemCardPills } from '../cards/ItemCardPills';
import { useTheme } from '../../lib/theme';

export function MemberRow({
  member,
  actorId,
  isOwner,
  busy,
  onRemove,
}: {
  member: { userId: string; email: string | null; role: 'owner' | 'member' };
  actorId: string;
  isOwner: boolean;
  busy: boolean;
  onRemove: (memberId: string, label: string) => void;
}) {
  const theme = useTheme();
  const emailLabel = householdMemberLabel(member.email);
  const isSelf = member.userId === actorId;
  const canKick = isOwner && member.role !== 'owner';
  const canLeave = isSelf && member.role !== 'owner';
  const pills = [
    {
      key: 'role',
      label: member.role === 'owner' ? 'Inhaber' : 'Mitglied',
      shape: 'pill' as const,
      emphasis: member.role === 'owner',
    },
    ...(isSelf
      ? [{ key: 'self', label: 'du', shape: 'tag' as const, emphasis: false }]
      : []),
  ];

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 36,
      paddingVertical: 4,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    email: {
      flex: 1,
      minWidth: 0,
      fontSize: 17,
      lineHeight: 22,
      fontFamily: 'Georgia',
      includeFontPadding: false,
      color: theme.ink,
    },
    action: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    actionText: {
      color: theme.rust,
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.row}>
      <Text style={styles.email}>{emailLabel}</Text>
      <ItemCardPills pills={pills} />
      {canKick || canLeave ? (
        <Pressable
          style={styles.action}
          disabled={busy}
          accessibilityRole="button"
          onPress={() => onRemove(member.userId, emailLabel)}
        >
          <Text style={styles.actionText}>{canLeave ? 'Austreten' : 'Entfernen'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
