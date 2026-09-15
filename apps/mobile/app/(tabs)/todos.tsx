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
import { todos } from '../../lib/todos';
import { useTheme } from '../../lib/theme';

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

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `todo_${Date.now()}`;
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
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TodoDraft>(emptyDraft);

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
        setHousehold(withEmail.memberEmails[user.uid] !== found.memberEmails?.[user.uid]
          ? await households.saveHousehold(withEmail).then(() => withEmail).catch(() => found)
          : found);
      });
    });
  }, [router]);

  useEffect(() => {
    if (!household) return;
    return todos.subscribeForHousehold(household.id, (next) => setItems(sortTodos(next)));
  }, [household]);

  const members = useMemo(() => (household ? householdMembers(household) : []), [household]);

  const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.paper },
    content: { padding: 24, gap: 16 },
    card: { backgroundColor: theme.sheet, borderRadius: 20, padding: 22, gap: 12 },
    title: { fontSize: 28, fontFamily: 'Georgia', color: theme.ink },
    muted: { color: theme.inkSoft },
    small: { color: theme.inkSoft, fontSize: 14 },
    err: { color: theme.rust },
    input: { borderWidth: 1, borderColor: theme.rule, borderRadius: 12, padding: 12, color: theme.ink, backgroundColor: theme.paper },
    btn: { backgroundColor: theme.sage, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    btnText: { color: theme.paper },
    ghost: { backgroundColor: theme.well, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    ghostText: { color: theme.ink },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    eventRow: { gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.rule },
    done: { textDecorationLine: 'line-through', color: theme.inkFaint },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  });

  async function saveTodo() {
    if (!household || !uid) return;
    setBusy(true);
    setError(null);
    try {
      const patch = {
        title: draft.title,
        dueDate: draft.dueDate || undefined,
        assignedTo: draft.assignedTo.length > 0 ? draft.assignedTo : undefined,
        completionMode: draft.completionMode,
        recurrence: draft.recurrence,
        kind: draft.kind,
        energyHint: draft.energyHint,
      };
      if (editingId) {
        const existing = items.find((i) => i.id === editingId);
        if (!existing) return;
        const result = prepareUpdateTodo({ actorId: uid, household, todo: existing, patch });
        if (!result.ok) { setError(createTodoErrorMessage(result.reason)); return; }
        await todos.saveTodo(result.todo);
      } else {
        const result = prepareCreateTodo({ actorId: uid, household, todoId: randomId(), ...patch, title: draft.title });
        if (!result.ok) { setError(createTodoErrorMessage(result.reason)); return; }
        await todos.createTodo(result.todo);
      }
      setShowForm(false);
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setError(messageFromStoreError(err, 'Todo konnte nicht gespeichert werden.'));
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
          <Text style={styles.title}>Todos</Text>
          {!showForm ? (
            <Pressable style={styles.btn} onPress={() => setShowForm(true)}>
              <Text style={styles.btnText}>Neu</Text>
            </Pressable>
          ) : null}
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {showForm ? (
          <View style={{ gap: 8 }}>
            <TextInput style={styles.input} placeholder="Titel" placeholderTextColor={theme.inkFaint} value={draft.title} onChangeText={(title) => setDraft({ ...draft, title })} />
            <Text style={styles.small}>Fälligkeit (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={draft.dueDate} onChangeText={(dueDate) => setDraft({ ...draft, dueDate })} />
            {members.map((m) => (
              <View key={m.userId} style={styles.row}>
                <Text style={styles.muted}>{m.email ?? 'E-Mail unbekannt'}</Text>
                <Switch
                  value={draft.assignedTo.includes(m.userId)}
                  onValueChange={() => {
                    const has = draft.assignedTo.includes(m.userId);
                    setDraft({ ...draft, assignedTo: has ? draft.assignedTo.filter((id) => id !== m.userId) : [...draft.assignedTo, m.userId] });
                  }}
                />
              </View>
            ))}
            <View style={styles.actions}>
              <Pressable style={styles.btn} disabled={busy} onPress={() => void saveTodo()}>
                <Text style={styles.btnText}>{editingId ? 'Speichern' : 'Anlegen'}</Text>
              </Pressable>
              <Pressable style={styles.ghost} onPress={() => { setShowForm(false); setEditingId(null); }}>
                <Text style={styles.ghostText}>Abbrechen</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        {items.map((todo) => {
          const done = isTodoDoneForUser(todo, uid);
          const canDelete = canDeleteTodo({ actorId: uid, household, todo });
          return (
            <View key={todo.id} style={styles.eventRow}>
              <View style={styles.row}>
                <Switch
                  value={done}
                  disabled={busy}
                  onValueChange={() => {
                    const result = prepareToggleTodoCompletion({
                      actorId: uid,
                      household,
                      todo,
                      done: !done,
                      doneAt: new Date().toISOString(),
                    });
                    if (result.ok) void todos.saveTodo(result.todo);
                  }}
                />
                <Text style={[styles.title, { fontSize: 18 }, done && styles.done]}>{todo.title}</Text>
              </View>
              {todo.dueDate ? <Text style={styles.small}>Fällig {formatDueDate(todo.dueDate)}</Text> : null}
              <Text style={styles.small}>
                {itemOpenClosedLabel(done)}
                {todo.completionMode === 'per_member'
                  ? ` · ${perMemberCompletionLabel(household, todo.completions)}`
                  : ''}
                {' · '}
                {todoAssigneeLabel(household, todo.assignedTo)} · {RECURRENCE_LABELS[todo.recurrence]} ·{' '}
                {COMPLETION_MODE_LABELS[todo.completionMode]} · {ENERGY_HINT_LABELS[todo.energyHint ?? 'medium']}
                {todo.kind === 'habit' ? ` · ${TODO_KIND_LABELS.habit}` : ''}
              </Text>
              <View style={styles.actions}>
                <Pressable style={styles.ghost} onPress={() => { setDraft({ title: todo.title, dueDate: todo.dueDate ?? '', assignedTo: todo.assignedTo ?? [], completionMode: todo.completionMode, recurrence: todo.recurrence, kind: todo.kind, energyHint: todo.energyHint ?? 'medium' }); setEditingId(todo.id); setShowForm(true); }}>
                  <Text style={styles.ghostText}>Bearbeiten</Text>
                </Pressable>
                {canDelete ? (
                  <Pressable style={styles.ghost} onPress={() => Alert.alert('Löschen', `„${todo.title}" löschen?`, [{ text: 'Abbrechen', style: 'cancel' }, { text: 'Löschen', style: 'destructive', onPress: () => void todos.deleteTodo(todo.id) }])}>
                    <Text style={styles.ghostText}>Löschen</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
