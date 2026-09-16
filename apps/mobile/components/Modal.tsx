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
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(43, 38, 31, 0.35)',
    },
    sheet: {
      maxHeight: '88%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.sheet,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    title: { flex: 1, fontSize: 22, fontFamily: 'Georgia', color: theme.ink },
    close: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.well,
    },
    scrollContent: { gap: 12, paddingBottom: 28 },
  });

  return (
    <RNModal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Schließen" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Schließen">
              <Text style={{ color: theme.ink, fontSize: 16 }}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
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
