'use client';

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
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { shopping } from '../../lib/shopping';

type ItemDraft = {
  name: string;
  category: ShoppingCategory;
};

function emptyDraft(): ItemDraft {
  return { name: '', category: 'supermarket' };
}

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    if (cat !== 0) {
      return cat;
    }
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
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<ShoppingCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);

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

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && (SHOPPING_CATEGORIES as readonly string[]).includes(category)) {
      setFilter(category as ShoppingCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return shopping.subscribeForHousehold(
      household.id,
      (next) => setItems(sortItems(next)),
      () => setError('Listen konnten nicht geladen werden.'),
    );
  }, [household]);

  const visible = useMemo(
    () => items.filter((item) => filter === 'all' || item.category === filter),
    [items, filter],
  );

  async function addItem() {
    if (!household || !uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = prepareCreateShoppingItem({
        actorId: uid,
        household,
        itemId: crypto.randomUUID(),
        name: draft.name,
        category: draft.category,
        createdAt: new Date().toISOString(),
      });
      if (!result.ok) {
        setError(createShoppingItemErrorMessage(result.reason));
        return;
      }
      await shopping.createItem(result.item);
      setDraft(emptyDraft());
      setShowForm(false);
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
    if (!window.confirm(`„${item.name}" löschen?`)) {
      return;
    }
    setBusy(true);
    try {
      await shopping.deleteItem(item.id);
    } catch (err) {
      setError(messageFromStoreError(err, 'Eintrag konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
  }

  const crumb =
    filter === 'all' ? 'Listen' : `Listen / ${SHOPPING_CATEGORY_LABELS[filter]}`;

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
            {!showForm ? (
              <button className="btn" type="button" onClick={() => setShowForm(true)}>
                Hinzufügen
              </button>
            ) : null}
          </header>
          <hr className="rule" />
          {error ? <p className="err" role="alert">{error}</p> : null}

          <div className="row-actions">
            <button
              className={`btn ${filter === 'all' ? '' : 'ghost'}`}
              type="button"
              onClick={() => setFilter('all')}
            >
              Alle
            </button>
            {SHOPPING_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`btn ${filter === category ? '' : 'ghost'}`}
                type="button"
                onClick={() => setFilter(category)}
              >
                {SHOPPING_CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          {showForm ? (
            <form
              className="stack wide"
              onSubmit={(e) => {
                e.preventDefault();
                void addItem();
              }}
            >
              <label className="field">
                Artikel
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Thema
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as ShoppingCategory })
                  }
                >
                  {SHOPPING_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {SHOPPING_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="row-actions">
                <button className="btn" type="submit" disabled={busy}>Anlegen</button>
                <button
                  className="btn ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setShowForm(false);
                    setDraft(emptyDraft());
                  }}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : null}

          {visible.length === 0 ? (
            <p className="muted">Keine Einträge in dieser Liste.</p>
          ) : (
            <ul className="plain-list event-list">
              {visible.map((item) => {
                const canDelete = canDeleteShoppingItem({ actorId: uid, household, item });
                return (
                  <li className="event-row" key={item.id}>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled={busy}
                        onChange={() => void toggleChecked(item)}
                      />
                      <span className={item.checked ? 'done' : undefined}>{item.name}</span>
                    </label>
                    <p className="muted small">
                      {itemOpenClosedLabel(item.checked)} · {SHOPPING_CATEGORY_LABELS[item.category]} · von{' '}
                      {shoppingAddedByLabel(household, item.addedBy)}
                    </p>
                    {canDelete ? (
                      <div className="row-actions">
                        <button
                          className="btn ghost"
                          type="button"
                          disabled={busy}
                          onClick={() => void removeItem(item)}
                        >
                          Löschen
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </div>
    </Chrome>
  );
}
