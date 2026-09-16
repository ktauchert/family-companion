import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

export function ModalActionBar({
  mode,
  done = false,
  busy = false,
  canDelete = false,
  primaryLabel,
  deleteLabel,
  onToggleDone,
  onPrimary,
  onCancel,
  onDelete,
}: {
  mode: 'view' | 'edit' | 'create';
  done?: boolean;
  busy?: boolean;
  canDelete?: boolean;
  primaryLabel: string;
  deleteLabel: string;
  onToggleDone?: () => void;
  onPrimary?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const theme = useTheme();
  const showDoneToggle = mode !== 'create' && onToggleDone;
  const showDelete = mode !== 'create' && canDelete && onDelete;

  const styles = StyleSheet.create({
    bar: {
      gap: 12,
      marginTop: 4,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    doneToggle: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.paper,
      alignItems: 'center',
    },
    doneToggleActive: {
      backgroundColor: theme.well,
      borderColor: theme.sage,
    },
    doneText: { color: theme.inkSoft, fontSize: 16 },
    doneTextActive: { color: theme.ink, fontWeight: '600' },
    footer: { flexDirection: 'row', gap: 8 },
    footerSingle: {},
    btn: {
      flex: 1,
      backgroundColor: theme.sage,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    btnText: { color: theme.paper, fontSize: 16, fontWeight: '600' },
    ghost: {
      flex: 1,
      backgroundColor: theme.well,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ghostText: { color: theme.ink, fontSize: 16 },
    deleteLink: { alignItems: 'center', paddingVertical: 4 },
    deleteText: { color: theme.rust, fontSize: 15 },
  });

  return (
    <View style={styles.bar}>
      {showDoneToggle ? (
        <Pressable
          style={[styles.doneToggle, done && styles.doneToggleActive]}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ selected: done }}
          accessibilityLabel={done ? 'Erledigt' : 'Als erledigt markieren'}
          onPress={onToggleDone}
        >
          <Text style={[styles.doneText, done && styles.doneTextActive]}>
            {done ? 'Erledigt' : 'Als erledigt markieren'}
          </Text>
        </Pressable>
      ) : null}
      <View style={[styles.footer, mode === 'view' && styles.footerSingle]}>
        {mode !== 'view' && onCancel ? (
          <Pressable style={styles.ghost} disabled={busy} onPress={onCancel} accessibilityLabel="Abbrechen">
            <Text style={styles.ghostText}>Abbrechen</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.btn}
          disabled={busy}
          onPress={onPrimary}
          accessibilityLabel={primaryLabel}
        >
          <Text style={styles.btnText}>{primaryLabel}</Text>
        </Pressable>
      </View>
      {showDelete ? (
        <Pressable
          style={styles.deleteLink}
          disabled={busy}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
        >
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
