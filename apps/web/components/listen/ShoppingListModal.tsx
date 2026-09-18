'use client';

import type { Household, ShoppingItem, ShoppingList } from '@family-companion/shared';
import {
  canDeleteShoppingList,
  shoppingListDeleteTargets,
} from '@family-companion/shared';
import { Modal } from '../Modal';
import { ModalActionBar } from '../ModalActionBar';

export type ShoppingListModalMode =
  | { kind: 'create' }
  | { kind: 'edit'; list: ShoppingList }
  | { kind: 'delete'; list: ShoppingList };

export function ShoppingListModal({
  open,
  mode,
  household,
  actorId,
  lists,
  items,
  name,
  moveToListId,
  busy,
  error,
  onNameChange,
  onMoveTargetChange,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  mode: ShoppingListModalMode | null;
  household: Household;
  actorId: string;
  lists: ShoppingList[];
  items: ShoppingItem[];
  name: string;
  moveToListId: string;
  busy: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onMoveTargetChange: (listId: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  if (!mode) {
    return null;
  }

  if (mode.kind === 'delete') {
    const canDelete = canDeleteShoppingList({
      actorId,
      household,
      list: mode.list,
    });
    const itemsInList = items.filter((item) => item.listId === mode.list.id);
    const moveTargets = shoppingListDeleteTargets(mode.list.id, lists);
    const needsMove = itemsInList.length > 0;

    return (
      <Modal open={open} title={`„${mode.list.name}" löschen?`} onClose={onClose}>
        <div className="stack wide">
          {error ? <p className="err" role="alert">{error}</p> : null}
          {!canDelete ? (
            <p className="muted">Nur der Haushalts-Inhaber kann Listen löschen.</p>
          ) : needsMove && moveTargets.length === 0 ? (
            <p className="muted">
              Diese Liste enthält noch Artikel, aber es gibt keine andere Liste zum Verschieben.
            </p>
          ) : (
            <>
              {needsMove ? (
                <>
                  <p className="muted">
                    {itemsInList.length} Artikel werden in eine andere Liste verschoben.
                  </p>
                  <label className="field">
                    Verschieben nach
                    <select
                      value={moveToListId}
                      disabled={busy}
                      onChange={(event) => onMoveTargetChange(event.target.value)}
                    >
                      {moveTargets.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <p className="muted">Die Liste ist leer und wird dauerhaft entfernt.</p>
              )}
              <ModalActionBar
                mode="edit"
                busy={busy}
                primaryLabel="Liste löschen"
                deleteLabel="Abbrechen"
                primaryType="button"
                onPrimary={onDelete}
                onCancel={onClose}
              />
            </>
          )}
        </div>
      </Modal>
    );
  }

  const title = mode.kind === 'create' ? 'Neue Liste' : 'Liste bearbeiten';

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form
        className="stack wide"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        {error ? <p className="err" role="alert">{error}</p> : null}
        <label className="field">
          Name
          <input
            value={name}
            required
            disabled={busy}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>
        <ModalActionBar
          mode={mode.kind === 'create' ? 'create' : 'edit'}
          busy={busy}
          primaryLabel={mode.kind === 'create' ? 'Anlegen' : 'Speichern'}
          deleteLabel="Abbrechen"
          primaryType="submit"
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
