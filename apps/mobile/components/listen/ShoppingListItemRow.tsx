import type { ShoppingItem } from '@family-companion/shared';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export function ShoppingListItemRow({
  item,
  busy,
  active,
  canDelete,
  onActivate,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  busy: boolean;
  active: boolean;
  canDelete: boolean;
  onActivate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();

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
    check: {
      width: 22,
      height: 22,
      borderWidth: 1,
      borderColor: item.checked ? theme.sage : theme.rule,
      borderRadius: 6,
      backgroundColor: item.checked ? theme.sage : theme.paper,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      flex: 1,
      fontSize: 17,
      lineHeight: 22,
      fontFamily: 'Georgia',
      includeFontPadding: false,
      textAlignVertical: 'center',
      color: item.checked ? theme.inkFaint : theme.ink,
      textDecorationLine: item.checked ? 'line-through' : 'none',
    },
    delete: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: active && canDelete ? 1 : 0,
    },
    deleteSlot: {
      width: 32,
      height: 32,
    },
  });

  return (
    <Pressable style={styles.row} onPress={onActivate} accessibilityRole="button">
      <Pressable
        style={styles.check}
        disabled={busy}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.checked }}
        accessibilityLabel={item.name}
        onPress={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {item.checked ? <Ionicons name="checkmark" size={14} color={theme.paper} /> : null}
      </Pressable>
      <Text style={styles.name}>{item.name}</Text>
      {canDelete ? (
        <Pressable
          style={styles.delete}
          disabled={!active || busy}
          pointerEvents={active ? 'auto' : 'none'}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} löschen`}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Ionicons name="trash-outline" size={20} color={theme.rust} />
        </Pressable>
      ) : (
        <View style={styles.deleteSlot} />
      )}
    </Pressable>
  );
}
