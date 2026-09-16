import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

export function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    field: { gap: 8 },
    label: { color: theme.inkSoft, fontSize: 14 },
    row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.paper,
    },
    chipSelected: { borderColor: theme.sage, backgroundColor: theme.well },
    chipText: { color: theme.inkSoft, fontSize: 14 },
    chipTextSelected: { color: theme.ink, fontWeight: '600' },
  });

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
