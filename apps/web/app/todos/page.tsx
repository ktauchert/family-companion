'use client';

import type { CompletionMode, EnergyBand, Household, Recurrence, TodoItem } from '@family-companion/shared';
import {
  COMPLETION_MODE_LABELS,
  ENERGY_HINT_LABELS,
  RECURRENCE_LABELS,
  TODO_KIND_LABELS,
  itemOpenClosedLabel,
  perMemberCompletionLabel,
  canDeleteTodo,
  createTodoErrorMessage,
  ensureMemberEmail,
  formatDueDate,
  householdMembers,
  isTodoDoneForUser,
  messageFromStoreError,
  prepareCreateTodo,
  prepareToggleTodoCompletion,
  prepareUpdateTodo,
  todoAssigneeLabel,
} from '@family-companion/shared';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Chrome } from '../../components/Chrome';
import { auth } from '../../lib/firebase';
import { households } from '../../lib/households';
import { todos } from '../../lib/todos';

type TodoDraft = {
  title: string;
  dueDate: string;
  assignedTo: string[];
  completionMode: CompletionMode;
  recurrence: Recurrence;
  kind: TodoItem['kind'];
  energyHint: EnergyBand;
};

function emptyDraft(): TodoDraft {
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

function draftFromTodo(todo: TodoItem): TodoDraft {
  return {
    title: todo.title,
    dueDate: todo.dueDate ?? '',
    assignedTo: todo.assignedTo ?? [],
    completionMode: todo.completionMode,
    recurrence: todo.recurrence,
    kind: todo.kind,
    energyHint: todo.energyHint ?? 'medium',
  };
}

function toggleAssignee(draft: TodoDraft, userId: string): TodoDraft {
  const has = draft.assignedTo.includes(userId);
  return {
    ...draft,
    assignedTo: has ? draft.assignedTo.filter((id) => id !== userId) : [...draft.assignedTo, userId],
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
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TodoDraft>(emptyDraft);

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

  function resetForm() {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function saveTodo() {
    if (!household || !uid) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const assignedTo = draft.assignedTo.length > 0 ? draft.assignedTo : undefined;
      const dueDate = draft.dueDate || undefined;

      if (editingId) {
        const existing = items.find((item) => item.id === editingId);
        if (!existing) {
          setError('Todo nicht gefunden.');
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
          setError(createTodoErrorMessage(result.reason));
          return;
        }
        await todos.saveTodo(result.todo);
      } else {
        const result = prepareCreateTodo({
          actorId: uid,
          household,
          todoId: crypto.randomUUID(),
          title: draft.title,
          dueDate,
          assignedTo,
          completionMode: draft.completionMode,
          recurrence: draft.recurrence,
          kind: draft.kind,
          energyHint: draft.energyHint,
        });
        if (!result.ok) {
          setError(createTodoErrorMessage(result.reason));
          return;
        }
        await todos.createTodo(result.todo);
      }
      resetForm();
    } catch (err) {
      console.error('[todo save]', err);
      setError(messageFromStoreError(err, 'Todo konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeTodo(todo: TodoItem) {
    if (!household || !uid || !canDeleteTodo({ actorId: uid, household, todo })) {
      return;
    }
    if (!window.confirm(`„${todo.title}" löschen?`)) {
      return;
    }
    setBusy(true);
    try {
      await todos.deleteTodo(todo.id);
    } catch (err) {
      setError(messageFromStoreError(err, 'Todo konnte nicht gelöscht werden.'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(todo: TodoItem) {
    if (!household || !uid) {
      return;
    }
    const result = prepareToggleTodoCompletion({
      actorId: uid,
      household,
      todo,
      done: !isTodoDoneForUser(todo, uid),
      doneAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(createTodoErrorMessage(result.reason));
      return;
    }
    setBusy(true);
    try {
      await todos.saveTodo(result.todo);
    } catch (err) {
      setError(messageFromStoreError(err, 'Erledigung konnte nicht gespeichert werden.'));
    } finally {
      setBusy(false);
    }
  }

  if (!household || !uid) {
    return (
      <Chrome crumb="Todos">
        <p className="muted">Laden…</p>
      </Chrome>
    );
  }

  return (
    <Chrome crumb="Todos" current="todos">
      <div className="cards wide">
        <article className="card stack wide">
          <header className="row-between">
            <h1>Todos</h1>
            {!showForm ? (
              <button className="btn" type="button" onClick={() => setShowForm(true)}>
                Neues Todo
              </button>
            ) : null}
          </header>
          <hr className="rule" />
          {error ? <p className="err" role="alert">{error}</p> : null}

          {showForm ? (
            <form
              className="stack wide"
              onSubmit={(e) => {
                e.preventDefault();
                void saveTodo();
              }}
            >
              <label className="field">
                Titel
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Fälligkeit (optional)
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                />
              </label>
              <fieldset className="field">
                <legend>Zuweisung</legend>
                <p className="muted small">Leer = ganzer Haushalt</p>
                {members.map((member) => (
                  <label className="check-row" key={member.userId}>
                    <input
                      type="checkbox"
                      checked={draft.assignedTo.includes(member.userId)}
                      onChange={() => setDraft(toggleAssignee(draft, member.userId))}
                    />
                    {member.email ?? 'E-Mail unbekannt'}
                    {member.userId === uid ? ' · du' : ''}
                  </label>
                ))}
              </fieldset>
              <label className="field">
                Wiederholung
                <select
                  value={draft.recurrence}
                  onChange={(e) => setDraft({ ...draft, recurrence: e.target.value as Recurrence })}
                >
                  {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Erledigung
                <select
                  value={draft.completionMode}
                  onChange={(e) =>
                    setDraft({ ...draft, completionMode: e.target.value as CompletionMode })
                  }
                >
                  {Object.entries(COMPLETION_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Art
                <select
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value as TodoItem['kind'] })}
                >
                  {Object.entries(TODO_KIND_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Energie-Hinweis
                <select
                  value={draft.energyHint}
                  onChange={(e) => setDraft({ ...draft, energyHint: e.target.value as EnergyBand })}
                >
                  {Object.entries(ENERGY_HINT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <div className="row-actions">
                <button className="btn" type="submit" disabled={busy}>
                  {editingId ? 'Speichern' : 'Anlegen'}
                </button>
                <button className="btn ghost" type="button" disabled={busy} onClick={resetForm}>
                  Abbrechen
                </button>
              </div>
            </form>
          ) : null}

          {items.length === 0 ? (
            <p className="muted">Noch keine Todos.</p>
          ) : (
            <ul className="plain-list event-list">
              {items.map((todo) => {
                const done = isTodoDoneForUser(todo, uid);
                const canDelete = canDeleteTodo({ actorId: uid, household, todo });
                return (
                  <li className="event-row" key={todo.id}>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={busy}
                        onChange={() => void toggleDone(todo)}
                      />
                      <span className={done ? 'done' : undefined}>{todo.title}</span>
                    </label>
                    {todo.dueDate ? (
                      <p className="muted small">Fällig {formatDueDate(todo.dueDate)}</p>
                    ) : null}
                    <p className="muted small">
                      {itemOpenClosedLabel(done)}
                      {todo.completionMode === 'per_member'
                        ? ` · ${perMemberCompletionLabel(household, todo.completions)}`
                        : ''}
                      {' · '}
                      {todoAssigneeLabel(household, todo.assignedTo)} ·{' '}
                      {RECURRENCE_LABELS[todo.recurrence]} · {COMPLETION_MODE_LABELS[todo.completionMode]}
                      {' · '}
                      {ENERGY_HINT_LABELS[todo.energyHint ?? 'medium']}
                      {todo.kind === 'habit' ? ` · ${TODO_KIND_LABELS.habit}` : ''}
                    </p>
                    <div className="row-actions">
                      <button
                        className="btn ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setDraft(draftFromTodo(todo));
                          setEditingId(todo.id);
                          setShowForm(true);
                        }}
                      >
                        Bearbeiten
                      </button>
                      {canDelete ? (
                        <button
                          className="btn ghost"
                          type="button"
                          disabled={busy}
                          onClick={() => void removeTodo(todo)}
                        >
                          Löschen
                        </button>
                      ) : null}
                    </div>
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
