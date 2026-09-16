import {
  formatCalendarDateTime,
  formatDueDate,
  fromDatetimeLocalValue,
  localDateString,
  toDatetimeLocalValue,
} from '@family-companion/shared';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

type DateTimeFieldMode = 'date' | 'datetime';

function parseFieldValue(value: string, mode: DateTimeFieldMode): Date {
  if (!value) {
    return new Date();
  }
  if (mode === 'date') {
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  const normalized = value.length === 16 ? `${value}:00` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function fieldValueFromDate(date: Date, mode: DateTimeFieldMode): string {
  if (mode === 'date') {
    return localDateString(date);
  }
  return toDatetimeLocalValue(date.toISOString());
}

function displayLabel(value: string, mode: DateTimeFieldMode, placeholder: string): string {
  if (!value) {
    return placeholder;
  }
  if (mode === 'date') {
    return formatDueDate(value);
  }
  const iso = fromDatetimeLocalValue(value.length === 16 ? `${value}:00` : value);
  return formatCalendarDateTime(iso);
}

function openAndroidDatePicker(current: Date, onSelect: (date: Date) => void) {
  DateTimePickerAndroid.open({
    value: current,
    mode: 'date',
    onValueChange: (_event, date) => onSelect(date),
  });
}

function openAndroidTimePicker(current: Date, onSelect: (date: Date) => void) {
  DateTimePickerAndroid.open({
    value: current,
    mode: 'time',
    is24Hour: true,
    onValueChange: (_event, date) => onSelect(date),
  });
}

export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  placeholder,
  optional = false,
  onClear,
}: {
  label: string;
  mode: DateTimeFieldMode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  onClear?: () => void;
}) {
  const theme = useTheme();
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const resolvedPlaceholder = placeholder ?? (optional ? 'Kein Datum' : 'Bitte wählen');
  const parsed = parseFieldValue(value, mode);

  const styles = StyleSheet.create({
    field: { gap: 8 },
    label: { color: theme.inkSoft, fontSize: 14 },
    trigger: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      padding: 12,
      backgroundColor: theme.paper,
    },
    value: { color: value ? theme.ink : theme.inkFaint, fontSize: 16 },
    clear: { color: theme.inkSoft, fontSize: 14, marginTop: 4 },
    pickerWrap: { alignItems: 'center' },
    done: {
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    doneText: { color: theme.sage, fontSize: 16, fontWeight: '600' },
  });

  function applyDate(date: Date) {
    onChange(fieldValueFromDate(date, mode));
  }

  function openPicker() {
    if (Platform.OS === 'ios') {
      setIosPickerOpen(true);
      return;
    }

    if (mode === 'date') {
      openAndroidDatePicker(parsed, applyDate);
      return;
    }

    openAndroidDatePicker(parsed, (datePart) => {
      const withDate = new Date(datePart);
      withDate.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
      openAndroidTimePicker(withDate, (timePart) => {
        withDate.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
        applyDate(withDate);
      });
    });
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={openPicker}>
        <Text style={styles.value}>{displayLabel(value, mode, resolvedPlaceholder)}</Text>
      </Pressable>
      {iosPickerOpen ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={parsed}
            mode={mode === 'date' ? 'date' : 'datetime'}
            locale="de-DE"
            display="spinner"
            onValueChange={(_event, date) => applyDate(date)}
          />
          <Pressable style={styles.done} onPress={() => setIosPickerOpen(false)} accessibilityLabel="Fertig">
            <Text style={styles.doneText}>Fertig</Text>
          </Pressable>
        </View>
      ) : null}
      {optional && value && onClear ? (
        <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={`${label} entfernen`}>
          <Text style={styles.clear}>Entfernen</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
