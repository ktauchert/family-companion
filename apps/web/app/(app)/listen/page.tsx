'use client';

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
  shoppingListName,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../../components/Chrome';
import { PlusIconButton } from '../../../components/PlusIconButton';
import { ShoppingListInlineAdd } from '../../../components/listen/ShoppingListInlineAdd';
import { ShoppingListItemRow } from '../../../components/listen/ShoppingListItemRow';
import {
  ShoppingListModal,
  type ShoppingListModalMode,
} from '../../../components/listen/ShoppingListModal';
import { auth } from '../../../lib/firebase';
import { households } from '../../../lib/households';
import { shopping } from '../../../lib/shopping';
import { shoppingLists } from '../../../lib/shoppingLists';

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
}

export default function ListenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [listModal, setListModal] = useState<ShoppingListModalMode | null>(null);
  const [listDraftName, setListDraftName] = useState('');
  const [moveToListId, setMoveToListId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [listModalError, setListModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listMenu, setListMenu] = useState<{ list: ShoppingList; x: number; y: number } | null>(
    null,
  );

  const isOwner = household && uid ? isHouseholdOwner(uid, household) : false;

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUid(user.uid);
      const found = await households.householdForUser(user.uid);
      if (!found) {
        router.replace('/onboarding');
        return;
      }
      const withEmail = ensureMemberEmail(found, {
        userId: user.uid,
        email: user.email ?? '',
      });
      if (withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]) {
        try {
          await households.saveHousehold(withEmail);
          setHousehold(withEmail);
        } catch {
          setHousehold(found);
        }
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  const listFromUrl = searchParams.get('list');

  useEffect(() => {
    if (!household || !uid) {
      return;
    }
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
          if (missing.length === 0) {
            return;
          }
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
    if (lists.length === 0) {
      return;
    }
    if (listFromUrl && lists.some((list) => list.id === listFromUrl)) {
      setActiveListId(listFromUrl);
      return;
    }
    const first = lists[0]!.id;
    setActiveListId(first);
    router.replace(`/listen?list=${encodeURIComponent(first)}`);
  }, [lists, listFromUrl, router]);

  useEffect(() => {
    setDraftName('');
  }, [activeListId]);

  useEffect(() => {
    if (!listMenu) {
      return;
    }
    const close = () => setListMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [listMenu]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return shopping.subscribeForHousehold(
      household.id,
      (next) => setItems(sortItems(next)),
      () => setError('Artikel konnten nicht geladen werden.'),
    );
  }, [household]);

  const visible = useMemo(
    () => (activeListId ? items.filter((item) => item.listId === activeListId) : []),
    [items, activeListId],
  );

  const activeListName = activeListId ? shoppingListName(activeListId, lists) : undefined;

  function selectList(listId: string) {
    setActiveListId(listId);
    router.replace(`/listen?list=${encodeURIComponent(listId)}`);
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
    setListMenu(null);
  }

  function openDeleteList(list: ShoppingList) {
    const targets = shoppingListDeleteTargets(list.id, lists);
    setListModal({ kind: 'delete', list });
    setListModalError(null);
    setMoveToListId(targets[0]?.id ?? '');
    setListMenu(null);
  }

  function openListMenu(list: ShoppingList, x: number, y: number) {
    selectList(list.id);
    setListMenu({ list, x, y });
  }

  async function saveListModal() {
    if (!household || !uid || !listModal || listModal.kind === 'delete') {
      return;
    }
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
    if (!household || !uid || !listModal || listModal.kind !== 'delete') {
      return;
    }
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
    if (!household || !uid || !activeListId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
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
        return;
      }
      await shopping.createItem(result.item);
      setDraftName('');
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht angelegt werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleChecked(item: ShoppingItem) {
    if (!household || !uid) {
      return;
    }
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
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
  }

  const crumb = activeListName ? `Listen / ${activeListName}` : 'Listen';

  if (!household || !uid) {
    return (
      <Chrome crumb="Listen">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb={crumb} current="listen">
      <div className="cards wide">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Einkaufslisten</h1>
            <PlusIconButton label="Neue Liste" onClick={openCreateList} />
          </header>
          <hr className="rule" />
          {error ? <p className="err" role="alert">{error}</p> : null}

          <div className="row-actions listen-tabs">
            {lists.map((list) => (
              <button
                key={list.id}
                className={`btn ${activeListId === list.id ? '' : 'ghost'}`}
                type="button"
                onClick={() => selectList(list.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  openListMenu(list, event.clientX, event.clientY);
                }}
              >
                {list.name}
              </button>
            ))}
          </div>

          {activeListId ? (
            <ShoppingListInlineAdd
              value={draftName}
              busy={busy}
              listKey={activeListId}
              historyItems={items}
              onChange={setDraftName}
              onConfirm={() => void addItem()}
              onCancel={() => setDraftName('')}
            />
          ) : null}

          {visible.length === 0 ? (
            <p className="muted">Keine Einträge in dieser Liste.</p>
          ) : (
            <ul className="listen-list">
              {visible.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  busy={busy}
                  canDelete={canDeleteShoppingItem({ actorId: uid, household, item })}
                  onToggle={() => void toggleChecked(item)}
                  onDelete={() => void removeItem(item)}
                />
              ))}
            </ul>
          )}
        </article>
      </div>

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

      {listMenu ? (
        <div
          className="listen-list-menu"
          role="menu"
          style={{ top: listMenu.y, left: listMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => openEditList(listMenu.list)}
          >
            Bearbeiten
          </button>
          {isOwner ? (
            <button
              type="button"
              role="menuitem"
              className="danger"
              onClick={() => openDeleteList(listMenu.list)}
            >
              Löschen
            </button>
          ) : null}
        </div>
      ) : null}
    </Chrome>
  );
}
