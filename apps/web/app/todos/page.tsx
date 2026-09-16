'use client';

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
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { PlusIconButton } from '../../components/PlusIconButton';
import { TodoCard } from '../../components/cards/TodoCard';
import {
  TodoItemModal,
  todoItemDraftFromItem,
  type TodoItemDraft,
} from '../../components/todos/TodoItemModal';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { todos } from '../../lib/todos';

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
  return [...items].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) {
      return -1;
    }
    if (b.dueDate) {
      return 1;
    }
    return a.title.localeCompare(b.title);
  });
}

export default function TodosPage() {
  const router = useRouter();
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
        } catch (err) {
          console.error('[member email]', err);
          setHousehold(found);
        }
        return;
      }
      setHousehold(found);
    });
  }, [router]);

  useEffect(() => {
    if (!household) {
      return;
    }
    return todos.subscribeForHousehold(
      household.id,
      (next) => setItems(sortTodos(next)),
      (err) => {
        console.error('[todos subscribe]', err);
        setError('Todos konnten nicht geladen werden.');
      },
    );
  }, [household]);

  const members = useMemo(
    () => (household ? householdMembers(household) : []),
    [household],
  );
  const selectedTodo = useMemo(
    () => (modal && modal.mode !== 'create' ? items.find((item) => item.id === modal.todoId) : undefined),
    [items, modal],
  );

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
      const assignedTo = draft.assignedTo.length > 0 ? draft.assignedTo : undefined;
      const dueDate = draft.dueDate || undefined;

      if (modal.mode === 'edit') {
        const existing = items.find((item) => item.id === modal.todoId);
        if (!existing) {
          setModalError('Todo nicht gefunden.');
          return;
        }
        const result = prepareUpdateTodo({
          actorId: uid,
          household,
          todo: existing,
          patch: {
            title: draft.title,
            dueDate,
            assignedTo,
            completionMode: draft.completionMode,
            recurrence: draft.recurrence,
            kind: draft.kind,
            energyHint: draft.energyHint,
          },
        });
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
          title: draft.title,
          dueDate,
          assignedTo,
          completionMode: draft.completionMode,
          recurrence: draft.recurrence,
          kind: draft.kind,
          energyHint: draft.energyHint,
        });
        if (!result.ok) {
          setModalError(createTodoErrorMessage(result.reason));
          return;
        }
        await todos.createTodo(result.todo);
      }
      closeModal();
    } catch (err) {
      console.error('[todo save]', err);
      setModalError(messageFromStoreError(err, 'Todo konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTodo() {
    if (!household || !uid || !selectedTodo) {
      return;
    }
    if (!canDeleteTodo({ actorId: uid, household, todo: selectedTodo })) {
      return;
    }
    if (!window.confirm(`„${selectedTodo.title}" löschen?`)) {
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      await todos.deleteTodo(selectedTodo.id);
      closeModal();
    } catch (err) {
      setModalError(messageFromStoreError(err, 'Todo konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
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

  async function toggleDoneInModal() {
    if (!selectedTodo) {
      return;
    }
    await toggleDone(selectedTodo, { inModal: true });
  }

  if (!household || !uid) {
    return (
      <Chrome crumb="Todos">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  const modalMode = modal?.mode === 'edit' ? 'edit' : modal?.mode === 'create' ? 'create' : 'view';
  const modalOpen = modal !== null;

  return (
    <Chrome crumb="Todos" current="todos">
      <div className="cards wide">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Todos</h1>
            <PlusIconButton label="Neues Todo" onClick={openCreate} />
          </header>
          <hr className="rule" />
          {error ? (
            <p className="err" role="alert">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <p className="muted">Noch keine Todos.</p>
          ) : (
            <div className="item-card-stack">
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
            </div>
          )}
        </article>
      </div>

      <TodoItemModal
        open={modalOpen}
        mode={modalMode}
        todo={selectedTodo}
        draft={draft}
        household={household}
        actorId={uid}
        members={members}
        busy={busy}
        modalError={modalError}
        done={selectedTodo ? isTodoDoneForUser(selectedTodo, uid) : false}
        canDelete={selectedTodo ? canDeleteTodo({ actorId: uid, household, todo: selectedTodo }) : false}
        onClose={closeModal}
        onDraftChange={setDraft}
        onSave={() => void saveTodo()}
        onDelete={() => void deleteTodo()}
        onToggleDone={() => void toggleDoneInModal()}
        onEdit={() => {
          if (selectedTodo) {
            setModal({ mode: 'edit', todoId: selectedTodo.id });
            setDraft(todoItemDraftFromItem(selectedTodo));
          }
        }}
      />
    </Chrome>
  );
}
