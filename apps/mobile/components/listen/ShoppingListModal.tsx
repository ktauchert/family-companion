import type { Household, ShoppingItem, ShoppingList } from '@family-companion/shared';
import {
  canDeleteShoppingList,
  shoppingListDeleteTargets,
} from '@family-companion/shared';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Modal } from '../Modal';
import { ModalActionBar } from '../ModalActionBar';
import { useTheme } from '../../lib/theme';

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
  const theme = useTheme();

  const styles = StyleSheet.create({
    muted: { color: theme.inkSoft },
    err: { color: theme.rust },
    input: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      padding: 12,
      color: theme.ink,
      backgroundColor: theme.paper,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      borderWidth: 1,
      borderColor: theme.rule,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.paper,
    },
    chipSelected: { borderColor: theme.sage, backgroundColor: theme.well },
    chipText: { color: theme.inkSoft },
    chipTextSelected: { color: theme.ink, fontWeight: '600' },
    label: { color: theme.inkSoft, fontSize: 14, marginBottom: 6 },
    stack: { gap: 12 },
  });

  if (!mode) {
    return null;
  }

  if (mode.kind === 'delete') {
    const canDelete = canDeleteShoppingList({ actorId, household, list: mode.list });
    const itemsInList = items.filter((item) => item.listId === mode.list.id);
    const moveTargets = shoppingListDeleteTargets(mode.list.id, lists);
    const needsMove = itemsInList.length > 0;

    return (
      <Modal open={open} title={`„${mode.list.name}" löschen?`} onClose={onClose}>
        <View style={styles.stack}>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {!canDelete ? (
            <Text style={styles.muted}>Nur der Haushalts-Inhaber kann Listen löschen.</Text>
          ) : needsMove && moveTargets.length === 0 ? (
            <Text style={styles.muted}>
              Diese Liste enthält noch Artikel, aber es gibt keine andere Liste zum Verschieben.
            </Text>
          ) : (
            <>
              {needsMove ? (
                <>
                  <Text style={styles.muted}>
                    {itemsInList.length} Artikel werden in eine andere Liste verschoben.
                  </Text>
                  <Text style={styles.label}>Verschieben nach</Text>
                  <View style={styles.chips}>
                    {moveTargets.map((list) => {
                      const selected = moveToListId === list.id;
                      return (
                        <Pressable
                          key={list.id}
                          style={[styles.chip, selected && styles.chipSelected]}
                          disabled={busy}
                          onPress={() => onMoveTargetChange(list.id)}
                        >
                          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                            {list.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : (
                <Text style={styles.muted}>Die Liste ist leer und wird dauerhaft entfernt.</Text>
              )}
              <ModalActionBar
                mode="edit"
                busy={busy}
                primaryLabel="Liste löschen"
                deleteLabel="Abbrechen"
                onPrimary={onDelete}
                onCancel={onClose}
              />
            </>
          )}
        </View>
      </Modal>
    );
  }

  const title = mode.kind === 'create' ? 'Neue Liste' : 'Liste bearbeiten';

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <View style={styles.stack}>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          editable={!busy}
          onChangeText={onNameChange}
        />
        <ModalActionBar
          mode={mode.kind === 'create' ? 'create' : 'edit'}
          busy={busy}
          primaryLabel={mode.kind === 'create' ? 'Anlegen' : 'Speichern'}
          deleteLabel="Abbrechen"
          onPrimary={onSave}
          onCancel={onClose}
        />
      </View>
    </Modal>
  );
}
