# Phase 0 — Monorepo-Gerüst

- Status: **erledigt**
- Branch: `main` (Init, kein Phasen-PR)
- Ergebnis: Turborepo + npm Workspaces, Shared-Package, Docs

## Arbeitspakete

### WP1 — Repo-Gerüst

- [x] Root mit npm Workspaces und `turbo.json`
- [x] `packages/shared` (Types, Zod, Firebase-Konstanten)
- [x] `packages/config-typescript`
- [x] Platzhalter `apps/web` und `apps/mobile`

### WP2 — Docs und ADRs

- [x] Notizen nach `docs/`
- [x] ADR-Ordner (`docs/adr/`)
- [x] Testing- und CI-Entscheidung festgehalten ([ADR 0002](../adr/0002-unit-tests-und-github-ci.md))
- [x] Kalender, Todos, Habits, Check-in, Listen in Docs/ADRs ([ADR 0003](../adr/0003-kalender-und-todos-sind-kern.md)–[0006](../adr/0006-kategorisierte-einkaufslisten.md))
- [x] `AGENTS.md` (Tests inkl. Negativfälle, `gh`, Phasen-PRs, Docs-Checkliste) *(ergänzt)*
- [x] `CONTRIBUTING.md` und README *(ergänzt)*
- [x] Phasen-Branches und lebende Docs ([ADR 0007](../adr/0007-phasen-branches-und-docs.md)) *(ergänzt)*
- [x] Phasen als einzelne Dateien mit Arbeitspaketen (`docs/phasen/`) *(ergänzt)*

### WP3 — GitHub und Agent-Skills

- [x] GitHub-Remote, erster Push auf `main` *(ergänzt)*
- [x] Matt-Pocock-Skills-Setup: GitHub Issues, single-context (`docs/agents/`) *(ergänzt)*
- [x] `.env.example` (Firebase Auth/Firestore/Storage, später Admin + OpenAI) *(ergänzt)*
