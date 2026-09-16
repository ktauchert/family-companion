import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(43, 38, 31, 0.35)', justifyContent: 'flex-end' },
    panel: {
      maxHeight: '88%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.sheet,
      padding: 20,
      gap: 12,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    title: { flex: 1, fontSize: 22, fontFamily: 'Georgia', color: theme.ink },
    close: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.well,
    },
    closeText: { color: theme.ink, fontSize: 16 },
  });

  return (
    <RNModal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Schließen">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function PlusFab({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 88,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.sage,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },
  });

  return (
    <Pressable style={styles.fab} onPress={onPress} accessibilityLabel={label}>
      <Ionicons name="add" size={28} color={theme.paper} />
    </Pressable>
  );
}
