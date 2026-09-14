# Contributing

Family Companion wird **phasenweise** gebaut. Eine Phase, ein Branch, ein PR nach `main`.

## Setup

- Node.js 20+
- npm (kein pnpm)

```bash
npm install
npm run type-check
npm run lint
```

`npm run test` läuft Vitest über Turbo (zuerst `@family-companion/shared`). Dev: `npm run dev` (beide über Turbo), `npm run dev:web`, `npm run dev:mobile` (Expo direkt, QR für Expo Go).

## Branch und PR

1. Von aktuellem `main` branchen, Name nach Phase: `phase-0.1-app-scaffolds`.
2. Änderungen + Docs (siehe unten).
3. Push, Pull Request gegen `main`.
4. Maintainer reviewed und merged. Danach erst die nächste Phase.

`gh` ist in Ordnung (`gh pr create`, `gh pr view`). Commit-Messages beschreiben das Warum.

## Tests

Tests dort, wo Logik kippen kann. Immer auch **Negativfälle** (ungültige Daten, Limit, falsches Tier). Details: [AGENTS.md](./AGENTS.md), [ADR 0002](./docs/adr/0002-unit-tests-und-github-ci.md).

## Docs

Nach jeder Anpassung die Checkliste in der aktuellen Datei unter [docs/phasen/](./docs/phasen/01-auth-haushalt.md) setzen. Index: [docs/phasenplan.md](./docs/phasenplan.md). Neuer Scope: Arbeitspaket aufnehmen und `*(ergänzt)*` markieren.

Persistierte Daten: vor dem Bau kurz **C/R/U/D** klären (wer darf anlegen, was muss lesbar sein, was ändert sich, wer darf löschen). Ohne Delete und ohne menschenlesbare Felder wird der Alltag starr — [AGENTS.md](./AGENTS.md), [lessons-learned.md](./docs/lessons-learned.md).

Architekturentscheidungen: [docs/adr/](./docs/adr/README.md). UI: [docs/design/ui.md](./docs/design/ui.md). Umwege: [docs/lessons-learned.md](./docs/lessons-learned.md).
