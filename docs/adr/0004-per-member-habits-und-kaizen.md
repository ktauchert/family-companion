# ADR 0004: Per-Member-Erledigung und Kaizen-Habits

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Manche Termine und Todos gelten für den Haushalt (*einer* hakte ab, erledigt für alle). Andere gelten für jede Person getrennt — z. B. Fitness: beide sollen es tun, beide müssen selbst abhaken. Zusätzlich sollen wiederkehrende Selbstverbesserungs-Habits Disziplin fördern (wenigstens 1 % heute, Kaizen / Ikigai), ohne die App zur Zwangscoach-App zu machen.

## Entscheidung

Zwei **Erledigungsmodi** für Kalender-Events und Todos:

- `household` — eine Erledigung reicht für alle (Default, Free).
- `per_member` — jedes Haushaltsmitglied sieht denselben Eintrag und hakte für sich ab.

**Habits** sind wiederkehrende Todos/Termine (`daily` / `weekly`), optional `mandatory` (jeden Tag sichtbar, bis die eigene Erledigung da ist).

**Kaizen-Loop (Pro, abschaltbar):**

- Wurde ein Pflicht-Habit am Tag nicht erledigt: Hinweis plus kurzer Motivationsspruch (Kaizen / Ikigai, am Ball bleiben).
- Ziel: Disziplin fördern, nicht bestrafen. Kein Streak-Zwang als Kernmechanik.

Free kann `per_member` an normalen Todos nutzen. Der Nudge, „mandatory täglich“-Habits als Selbstverbesserungspaket und die Sprüche sind Pro.

## Konsequenzen

- Completions sind nicht ein Statusfeld, sondern pro User und Tag (oder pro Event-Instanz).
- Dashboard und Startansicht müssen offene *eigene* Pflicht-Habits prominent zeigen.
- Texte/Sprüche brauchen eine kleine Quelle (lokal oder später KI); Ton bleibt unterstützend.

## Alternativen

- **Nur Zuweisung an eine Person:** deckt „Fitness für beide“ nicht ab.
- **Getrennte Todos pro Person anlegen:** dupliziert Daten, bricht die gemeinsame Definition.
- **Streaks und Gamification als Kern:** zu nah an Fitness-Apps, nicht am Haushalts-Alltag.

## UI-Hinweis (Phase 2.2, 2026-09-15)

Kalender-Habits bleiben am **Kalender** (geteilte Wochenansicht für den Haushalt). Abhaken im **View-Modal**, nicht in der Event-Liste — Completion-Daten bleiben für Kaizen/LLM (Phase 4). Todo-Habits für Aufgaben ohne festen Zeit-Slot. Details: [02.2-kalender-todos-ux.md](../phasen/02.2-kalender-todos-ux.md).
