import type { ShoppingItem } from '@family-companion/shared';
import { suggestShoppingItemNames } from '@family-companion/shared';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

export function ShoppingListInlineAdd({
  value,
  busy,
  historyItems,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: string;
  busy: boolean;
  historyItems: ShoppingItem[];
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const canConfirm = value.trim().length > 0 && !busy;
  const suggestions = useMemo(
    () => suggestShoppingItemNames({ query: value, items: historyItems }),
    [value, historyItems],
  );

  const styles = StyleSheet.create({
    stack: { gap: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      color: theme.ink,
      backgroundColor: theme.paper,
      fontSize: 16,
    },
    btn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      backgroundColor: theme.well,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDisabled: { opacity: 0.45 },
    suggestions: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.paper,
    },
    suggestion: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderTopWidth: 1,
      borderTopColor: theme.rule,
    },
    suggestionText: { color: theme.ink, fontSize: 16 },
  });

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Artikel hinzufügen…"
          placeholderTextColor={theme.inkFaint}
          value={value}
          editable={!busy}
          onChangeText={onChange}
          onSubmitEditing={() => {
            if (canConfirm) onConfirm();
          }}
          returnKeyType="done"
          accessibilityLabel="Artikel hinzufügen"
        />
        <Pressable
          style={[styles.btn, !canConfirm && styles.btnDisabled]}
          disabled={!canConfirm}
          accessibilityRole="button"
          accessibilityLabel="Anlegen"
          onPress={onConfirm}
        >
          <Ionicons name="checkmark" size={22} color={theme.ink} />
        </Pressable>
        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Eingabe löschen"
          onPress={onCancel}
        >
          <Ionicons name="close" size={22} color={theme.ink} />
        </Pressable>
      </View>
      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((name, index) => (
            <Pressable
              key={name}
              style={[styles.suggestion, index === 0 && { borderTopWidth: 0 }]}
              onPress={() => onChange(name)}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
