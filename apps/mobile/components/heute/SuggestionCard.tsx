import type { Household, PrioritizationSuggestion } from '@family-companion/shared';
import { householdMemberLabel } from '@family-companion/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function SuggestionCard({
  suggestion,
  household,
  busy,
  onConfirm,
  onDismiss,
}: {
  suggestion: PrioritizationSuggestion;
  household: Household;
  busy: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    card: {
      gap: 10,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.rule,
      backgroundColor: theme.paper,
    },
    muted: { color: theme.inkSoft, fontSize: 14 },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    btn: { backgroundColor: theme.sage, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
    btnText: { color: theme.paper, fontWeight: '600' },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
    ghostText: { color: theme.ink },
  });

  return (
    <View style={styles.card}>
      <Text style={{ color: theme.inkSoft }}>{suggestion.message}</Text>
      {suggestion.suggestedAssignee ? (
        <Text style={styles.muted}>
          Vorschlag:{' '}
          {householdMemberLabel(household.memberEmails?.[suggestion.suggestedAssignee] ?? null)}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable style={styles.btn} disabled={busy} onPress={onConfirm}>
          <Text style={styles.btnText}>Bestätigen</Text>
        </Pressable>
        <Pressable style={styles.ghost} disabled={busy} onPress={onDismiss}>
          <Text style={styles.ghostText}>Ablehnen</Text>
        </Pressable>
      </View>
    </View>
  );
}
