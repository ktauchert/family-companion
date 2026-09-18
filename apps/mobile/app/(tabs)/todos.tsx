import type { Household, TodoItem } from '@family-companion/shared';
import {
  canDeleteTodo,
  createTodoErrorMessage,
  ensureMemberEmail,
  householdMembers,
  isTodoDoneForUser,
  messageFromStoreError,
  newEntityId,
  prepareCreateTodo,
  prepareToggleTodoCompletion,
  prepareUpdateTodo,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TodoCard } from '../../components/cards/TodoCard';
import { PlusFab } from '../../components/Modal';
import {
  TodoItemModal,
  todoItemDraftFromItem,
  type TodoItemDraft,
} from '../../components/todos/TodoItemModal';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { todos } from '../../lib/todos';
import { useTheme } from '../../lib/theme';

type ModalState =
  | null
  | { mode: 'create' }
  | { mode: 'view'; todoId: string }
  | { mode: 'edit'; todoId: string };

function emptyDraft(): TodoItemDraft {
  return {
    title: '',
    dueDate: '',
    assignedTo: [],
    completionMode: 'household',
    recurrence: 'none',
    kind: 'task',
    energyHint: 'medium',
  };
}

function sortTodos(items: TodoItem[]): TodoItem[] {
  return [...items].sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || a.title.localeCompare(b.title));
}

export default function TodosScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<TodoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingTodoId, setTogglingTodoId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<TodoItemDraft>(emptyDraft);

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
        setHousehold(
          withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]
            ? await households.saveHousehold(withEmail).then(() => withEmail).catch(() => found)
            : found,
        );
      });
    });
  }, [router]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return todos.subscribeForHousehold(household.id, (next) => setItems(sortTodos(next)));
  }, [household]);

  const members = useMemo(() => (household ? householdMembers(household) : []), [household]);
  const selectedTodo = useMemo(
    () => (modal && modal.mode !== 'create' ? items.find((item) => item.id === modal.todoId) : undefined),
    [items, modal],
  );

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, paddingBottom: 120, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    muted: { color: theme.inkSoft },
    err: { color: theme.rust },
    stack: { gap: 10 },
  });

  function closeModal() {
    setModal(null);
    setModalError(null);
    setDraft(emptyDraft());
  }

  function openCreate() {
    setDraft(emptyDraft());
    setModal({ mode: 'create' });
    setModalError(null);
  }

  function openView(todo: TodoItem) {
    setDraft(todoItemDraftFromItem(todo));
    setModal({ mode: 'view', todoId: todo.id });
    setModalError(null);
  }

  async function saveTodo() {
    if (!household || !uid || !modal) {
      return;
    }
    if (!draft.title.trim()) {
      setModalError(createTodoErrorMessage('title_required'));
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      const patch = {
        title: draft.title,
        dueDate: draft.dueDate || undefined,
        assignedTo: draft.assignedTo.length > 0 ? draft.assignedTo : undefined,
        completionMode: draft.completionMode,
        recurrence: draft.recurrence,
        kind: draft.kind,
        energyHint: draft.energyHint,
        mandatoryDaily: draft.mandatoryDaily,
      };
      if (modal.mode === 'edit') {
        const existing = items.find((item) => item.id === modal.todoId);
        if (!existing) {
          setModalError('Todo nicht gefunden.');
          return;
        }
        const result = prepareUpdateTodo({ actorId: uid, household, todo: existing, patch });
        if (!result.ok) {
          setModalError(createTodoErrorMessage(result.reason));
          return;
        }
        await todos.saveTodo(result.todo);
      } else {
        const result = prepareCreateTodo({
          actorId: uid,
          household,
          todoId: newEntityId('todo'),
          ...patch,
          title: draft.title,
        });
        if (!result.ok) {
          setModalError(createTodoErrorMessage(result.reason));
          return;
        }
        await todos.createTodo(result.todo);
      }
      closeModal();
    } catch (err) {
      setModalError(messageFromStoreError(err, 'Todo konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  function deleteTodo() {
    if (!household || !uid || !selectedTodo) {
      return;
    }
    if (!canDeleteTodo({ actorId: uid, household, todo: selectedTodo })) {
      return;
    }
    Alert.alert('Löschen', `„${selectedTodo.title}" löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          void todos
            .deleteTodo(selectedTodo.id)
            .then(() => closeModal())
            .catch((err) => setModalError(messageFromStoreError(err, 'Todo konnte nicht gelöscht werden.')))
            .finally(() => setBusy(false));
        },
      },
    ]);
  }

  async function toggleDone(todo: TodoItem, options?: { inModal?: boolean }) {
    if (!household || !uid) {
      return;
    }
    const reportError = options?.inModal ? setModalError : setError;
    if (options?.inModal) {
      setModalError(null);
    } else {
      setError(null);
    }
    const result = prepareToggleTodoCompletion({
      actorId: uid,
      household,
      todo,
      done: !isTodoDoneForUser(todo, uid),
      doneAt: new Date().toISOString(),
    });
    if (!result.ok) {
      reportError(createTodoErrorMessage(result.reason));
      return;
    }
    if (options?.inModal) {
      setBusy(true);
    } else {
      setTogglingTodoId(todo.id);
    }
    try {
      await todos.saveTodo(result.todo);
    } catch (err) {
      reportError(messageFromStoreError(err, 'Erledigung konnte nicht gespeichert werden.'));
    } finally {
      if (options?.inModal) {
        setBusy(false);
      } else {
        setTogglingTodoId(null);
      }
    }
  }

  if (!household || !uid) {
    return (
      <View style={[styles.page, styles.content]}>
        <Text style={styles.muted}>Laden…</Text>
      </View>
    );
  }

  const modalMode = modal?.mode === 'edit' ? 'edit' : modal?.mode === 'create' ? 'create' : 'view';

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Todos</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {items.length === 0 ? (
            <Text style={styles.muted}>Noch keine Todos.</Text>
          ) : (
            <View style={styles.stack}>
              {items.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  household={household}
                  actorId={uid}
                  done={isTodoDoneForUser(todo, uid)}
                  toggling={togglingTodoId === todo.id}
                  onPress={() => openView(todo)}
                  onToggleDone={() => void toggleDone(todo)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <PlusFab label="Neues Todo" onPress={openCreate} />

      <TodoItemModal
        open={modal !== null}
        mode={modalMode}
        todo={selectedTodo}
        draft={draft}
        household={household}
        actorId={uid}
        isPro={household.plan === 'pro'}
        members={members}
        busy={busy}
        modalError={modalError}
        done={selectedTodo ? isTodoDoneForUser(selectedTodo, uid) : false}
        canDelete={selectedTodo ? canDeleteTodo({ actorId: uid, household, todo: selectedTodo }) : false}
        onClose={closeModal}
        onDraftChange={setDraft}
        onSave={() => void saveTodo()}
        onDelete={deleteTodo}
        onToggleDone={() => selectedTodo && void toggleDone(selectedTodo, { inModal: true })}
        onEdit={() => {
          if (selectedTodo) {
            setModal({ mode: 'edit', todoId: selectedTodo.id });
            setDraft(todoItemDraftFromItem(selectedTodo));
          }
        }}
      />
    </View>
  );
}
