import type { Household, ShoppingCategory, ShoppingItem } from '@family-companion/shared';
import {
  SHOPPING_CATEGORIES,
  SHOPPING_CATEGORY_LABELS,
  itemOpenClosedLabel,
  canDeleteShoppingItem,
  createShoppingItemErrorMessage,
  ensureMemberEmail,
  messageFromStoreError,
  prepareCreateShoppingItem,
  prepareToggleShoppingItemChecked,
  shoppingAddedByLabel,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { shopping } from '../../lib/shopping';
import { useTheme } from '../../lib/theme';

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `shop_${Date.now()}`;
}

export default function ListenScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<ShoppingCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('supermarket');

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
        const withEmail = ensureMemberEmail(found, { userId: user.uid, email: user.email ?? '' });
        setHousehold(withEmail);
      });
    });
  }, [router]);

  useEffect(() => {
    if (!household) return;
    return shopping.subscribeForHousehold(household.id, setItems);
  }, [household]);

  const visible = useMemo(
    () => items.filter((item) => filter === 'all' || item.category === filter),
    [items, filter],
  );

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    muted: { color: theme.inkSoft },
    small: { color: theme.inkSoft, fontSize: 14 },
    err: { color: theme.rust },
    input: { borderWidth: 1, borderColor: theme.rule, borderRadius: 12, padding: 12, color: theme.ink, backgroundColor: theme.paper },
    btn: { backgroundColor: theme.sage, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
    btnText: { color: theme.paper },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
    ghostText: { color: theme.ink },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    eventRow: { gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.rule },
    done: { textDecorationLine: 'line-through', color: theme.inkFaint },
  });

  async function addItem() {
    if (!household || !uid) return;
    setBusy(true);
    const result = prepareCreateShoppingItem({
      actorId: uid,
      household,
      itemId: randomId(),
      name,
      category,
      createdAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(createShoppingItemErrorMessage(result.reason));
      setBusy(false);
      return;
    }
    try {
      await shopping.createItem(result.item);
      setName('');
      setShowForm(false);
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht angelegt werden.'));
    } finally {
      setBusy(false);
    }
  }

  if (!household || !uid) {
    return <View style={[styles.page, styles.content]}><Text style={styles.muted}>Laden…</Text></View>;
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>Listen</Text>
          {!showForm ? (
            <Pressable style={styles.btn} onPress={() => setShowForm(true)}>
              <Text style={styles.btnText}>Neu</Text>
            </Pressable>
          ) : null}
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <View style={styles.chips}>
          <Pressable style={styles.ghost} onPress={() => setFilter('all')}>
            <Text style={styles.ghostText}>Alle</Text>
          </Pressable>
          {SHOPPING_CATEGORIES.map((cat) => (
            <Pressable key={cat} style={styles.ghost} onPress={() => setFilter(cat)}>
              <Text style={styles.ghostText}>{SHOPPING_CATEGORY_LABELS[cat]}</Text>
            </Pressable>
          ))}
        </View>
        {showForm ? (
          <View style={{ gap: 8 }}>
            <TextInput style={styles.input} placeholder="Artikel" placeholderTextColor={theme.inkFaint} value={name} onChangeText={setName} />
            <View style={styles.chips}>
              {SHOPPING_CATEGORIES.map((cat) => (
                <Pressable key={cat} style={styles.ghost} onPress={() => setCategory(cat)}>
                  <Text style={styles.ghostText}>{SHOPPING_CATEGORY_LABELS[cat]}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.btn} disabled={busy} onPress={() => void addItem()}>
              <Text style={styles.btnText}>Anlegen</Text>
            </Pressable>
          </View>
        ) : null}
        {visible.length === 0 ? (
          <Text style={styles.muted}>Keine Einträge.</Text>
        ) : (
          visible.map((item) => {
            const canDelete = canDeleteShoppingItem({ actorId: uid, household, item });
            return (
              <View key={item.id} style={styles.eventRow}>
                <View style={styles.row}>
                  <Switch
                    value={item.checked}
                    disabled={busy}
                    onValueChange={() => {
                      const result = prepareToggleShoppingItemChecked({
                        actorId: uid,
                        household,
                        item,
                        checked: !item.checked,
                        checkedAt: new Date().toISOString(),
                      });
                      if (result.ok) void shopping.saveItem(result.item);
                    }}
                  />
                  <Text style={[styles.title, { fontSize: 18 }, item.checked && styles.done]}>{item.name}</Text>
                </View>
                <Text style={styles.small}>
                  {itemOpenClosedLabel(item.checked)} · {SHOPPING_CATEGORY_LABELS[item.category]} ·{' '}
                  {shoppingAddedByLabel(household, item.addedBy)}
                </Text>
                {canDelete ? (
                  <Pressable
                    style={styles.ghost}
                    onPress={() =>
                      Alert.alert('Löschen', `„${item.name}" löschen?`, [
                        { text: 'Abbrechen', style: 'cancel' },
                        { text: 'Löschen', style: 'destructive', onPress: () => void shopping.deleteItem(item.id) },
                      ])
                    }
                  >
                    <Text style={styles.ghostText}>Löschen</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
