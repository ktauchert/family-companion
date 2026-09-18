import type { Household, ShoppingItem, ShoppingList } from '@family-companion/shared';
import {
  canDeleteShoppingItem,
  createShoppingItemErrorMessage,
  createShoppingListErrorMessage,
  ensureMemberEmail,
  isHouseholdOwner,
  messageFromStoreError,
  missingDefaultShoppingLists,
  newEntityId,
  nextShoppingListSortOrder,
  prepareCreateShoppingItem,
  prepareCreateShoppingList,
  prepareDeleteShoppingListPlan,
  prepareToggleShoppingItemChecked,
  prepareUpdateShoppingList,
  shoppingListDeleteTargets,
} from '@family-companion/shared';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ShoppingListInlineAdd } from '../../components/listen/ShoppingListInlineAdd';
import { ShoppingListItemRow } from '../../components/listen/ShoppingListItemRow';
import {
  ShoppingListModal,
  type ShoppingListModalMode,
} from '../../components/listen/ShoppingListModal';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { shopping } from '../../lib/shopping';
import { shoppingLists } from '../../lib/shoppingLists';
import { useTheme } from '../../lib/theme';

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
}

export default function ListenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ list?: string }>();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [listModal, setListModal] = useState<ShoppingListModalMode | null>(null);
  const [listDraftName, setListDraftName] = useState('');
  const [moveToListId, setMoveToListId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [listModalError, setListModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isOwner = household && uid ? isHouseholdOwner(uid, household) : false;

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

  const listFromUrl =
    typeof params.list === 'string'
      ? params.list
      : Array.isArray(params.list)
        ? params.list[0]
        : undefined;

  useEffect(() => {
    if (!household || !uid) return;
    return shoppingLists.subscribeForHousehold(
      household.id,
      (next) => {
        setLists(next);
        void (async () => {
          const missing = missingDefaultShoppingLists(next, {
            householdId: household.id,
            createdBy: uid,
            createdAt: new Date().toISOString(),
          });
          if (missing.length === 0) return;
          try {
            await Promise.all(missing.map((list) => shoppingLists.createList(list)));
          } catch {
            setError('Standard-Listen konnten nicht angelegt werden.');
          }
        })();
      },
      () => setError('Listen konnten nicht geladen werden.'),
    );
  }, [household, uid]);

  useEffect(() => {
    if (lists.length === 0) return;
    if (listFromUrl && lists.some((list) => list.id === listFromUrl)) {
      setActiveListId(listFromUrl);
      return;
    }
    const first = lists[0]!.id;
    setActiveListId(first);
    router.setParams({ list: first });
  }, [lists, listFromUrl, router]);

  useEffect(() => {
    setDraftName('');
    setActiveItemId(null);
  }, [activeListId]);

  useEffect(() => {
    if (!household) return;
    return shopping.subscribeForHousehold(household.id, (next) => setItems(sortItems(next)));
  }, [household]);

  const visible = useMemo(
    () => (activeListId ? items.filter((item) => item.listId === activeListId) : []),
    [items, activeListId],
  );

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink, flex: 1 },
    muted: { color: theme.inkSoft },
    err: { color: theme.rust },
    plusBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.rule,
      backgroundColor: theme.well,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
    ghostText: { color: theme.ink },
    chipSelected: { borderWidth: 1, borderColor: theme.sage, backgroundColor: theme.well },
    chipTextSelected: { color: theme.ink, fontWeight: '600' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    list: { marginTop: 4 },
  });

  function selectList(listId: string) {
    setActiveListId(listId);
    router.setParams({ list: listId });
  }

  function closeListModal() {
    setListModal(null);
    setListModalError(null);
    setListDraftName('');
    setMoveToListId('');
  }

  function openCreateList() {
    setListModal({ kind: 'create' });
    setListModalError(null);
    setListDraftName('');
  }

  function openEditList(list: ShoppingList) {
    setListModal({ kind: 'edit', list });
    setListModalError(null);
    setListDraftName(list.name);
  }

  function openDeleteList(list: ShoppingList) {
    const targets = shoppingListDeleteTargets(list.id, lists);
    setListModal({ kind: 'delete', list });
    setListModalError(null);
    setMoveToListId(targets[0]?.id ?? '');
  }

  function showListMenu(list: ShoppingList) {
    selectList(list.id);
    const buttons: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[] = [{ text: 'Bearbeiten', onPress: () => openEditList(list) }];
    if (isOwner) {
      buttons.push({
        text: 'Löschen',
        style: 'destructive',
        onPress: () => openDeleteList(list),
      });
    }
    buttons.push({ text: 'Abbrechen', style: 'cancel' });
    Alert.alert(list.name, undefined, buttons);
  }

  async function saveListModal() {
    if (!household || !uid || !listModal || listModal.kind === 'delete') return;
    setBusy(true);
    setListModalError(null);
    try {
      if (listModal.kind === 'create') {
        const result = prepareCreateShoppingList({
          actorId: uid,
          household,
          listId: newEntityId('list'),
          name: listDraftName,
          sortOrder: nextShoppingListSortOrder(lists),
          createdAt: new Date().toISOString(),
        });
        if (!result.ok) {
          setListModalError(createShoppingListErrorMessage(result.reason));
          return;
        }
        await shoppingLists.createList(result.list);
        selectList(result.list.id);
      } else {
        const result = prepareUpdateShoppingList({
          actorId: uid,
          household,
          list: listModal.list,
          patch: { name: listDraftName },
        });
        if (!result.ok) {
          setListModalError(createShoppingListErrorMessage(result.reason));
          return;
        }
        await shoppingLists.saveList(result.list);
      }
      closeListModal();
    } catch (err) {
      setListModalError(messageFromStoreError(err, 'Liste konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDeleteList() {
    if (!household || !uid || !listModal || listModal.kind !== 'delete') return;
    setBusy(true);
    setListModalError(null);
    try {
      const plan = prepareDeleteShoppingListPlan({
        actorId: uid,
        household,
        list: listModal.list,
        lists,
        items,
        moveToListId: moveToListId || undefined,
      });
      if (!plan.ok) {
        setListModalError(createShoppingListErrorMessage(plan.reason));
        return;
      }
      if (plan.kind === 'relocate_and_delete') {
        await shopping.saveItems(plan.items);
      }
      await shoppingLists.deleteList(listModal.list.id);
      const fallback =
        plan.kind === 'relocate_and_delete'
          ? moveToListId
          : lists.find((list) => list.id !== listModal.list.id)?.id;
      closeListModal();
      if (fallback) {
        selectList(fallback);
      }
    } catch (err) {
      setListModalError(messageFromStoreError(err, 'Liste konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function addItem() {
    if (!household || !uid || !activeListId) return;
    setBusy(true);
    setError(null);
    const result = prepareCreateShoppingItem({
      actorId: uid,
      household,
      itemId: newEntityId('shop'),
      name: draftName,
      listId: activeListId,
      lists,
      createdAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(createShoppingItemErrorMessage(result.reason));
      setBusy(false);
      return;
    }
    try {
      await shopping.createItem(result.item);
      setDraftName('');
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht angelegt werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleChecked(item: ShoppingItem) {
    if (!household || !uid) return;
    const result = prepareToggleShoppingItemChecked({
      actorId: uid,
      household,
      item,
      lists,
      checked: !item.checked,
      checkedAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(createShoppingItemErrorMessage(result.reason));
      return;
    }
    setBusy(true);
    try {
      await shopping.saveItem(result.item);
    } catch (err) {
      setError(messageFromStoreError(err, 'Abhaken fehlgeschlagen.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(item: ShoppingItem) {
    if (!household || !uid || !canDeleteShoppingItem({ actorId: uid, household, item })) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await shopping.deleteItem(item.id);
      setActiveItemId(null);
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
  }

  if (!household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Listen</Text>
            <Pressable
              style={styles.plusBtn}
              accessibilityRole="button"
              accessibilityLabel="Neue Liste"
              onPress={openCreateList}
            >
              <Ionicons name="add" size={24} color={theme.ink} />
            </Pressable>
          </View>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <View style={styles.chips}>
            {lists.map((list) => {
              const selected = activeListId === list.id;
              return (
                <Pressable
                  key={list.id}
                  style={[styles.ghost, selected && styles.chipSelected]}
                  onPress={() => selectList(list.id)}
                  onLongPress={() => showListMenu(list)}
                  delayLongPress={350}
                >
                  <Text style={[styles.ghostText, selected && styles.chipTextSelected]}>{list.name}</Text>
                </Pressable>
              );
            })}
          </View>

          {activeListId ? (
            <ShoppingListInlineAdd
              value={draftName}
              busy={busy}
              historyItems={items}
              onChange={setDraftName}
              onConfirm={() => void addItem()}
              onCancel={() => setDraftName('')}
            />
          ) : null}

          {visible.length === 0 ? (
            <Text style={styles.muted}>Keine Einträge.</Text>
          ) : (
            <View style={styles.list}>
              {visible.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  busy={busy}
                  active={activeItemId === item.id}
                  canDelete={canDeleteShoppingItem({ actorId: uid, household, item })}
                  onActivate={() =>
                    setActiveItemId((current) => (current === item.id ? null : item.id))
                  }
                  onToggle={() => void toggleChecked(item)}
                  onDelete={() => void removeItem(item)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ShoppingListModal
        open={listModal !== null}
        mode={listModal}
        household={household}
        actorId={uid}
        lists={lists}
        items={items}
        name={listDraftName}
        moveToListId={moveToListId}
        busy={busy}
        error={listModalError}
        onNameChange={setListDraftName}
        onMoveTargetChange={setMoveToListId}
        onClose={closeListModal}
        onSave={() => void saveListModal()}
        onDelete={() => void confirmDeleteList()}
      />
    </>
  );
}
