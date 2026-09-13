# Contributing

Family Companion wird **phasenweise** gebaut. Eine Phase, ein Branch, ein PR nach `main`.

## Setup

- Node.js 20+
- npm (kein pnpm)

```bash
npm install
npm run type-check
```

`npm run test` folgt in Phase 0.2 (Vitest).

## Branch und PR

1. Von aktuellem `main` branchen, Name nach Phase: `phase-0.1-app-scaffolds`.
2. Änderungen + Docs (siehe unten).
3. Push, Pull Request gegen `main`.
4. Maintainer reviewed und merged. Danach erst die nächste Phase.

`gh` ist in Ordnung (`gh pr create`, `gh pr view`). Commit-Messages beschreiben das Warum.

## Tests

Tests dort, wo Logik kippen kann. Immer auch **Negativfälle** (ungültige Daten, Limit, falsches Tier). Details: [AGENTS.md](./AGENTS.md), [ADR 0002](./docs/adr/0002-unit-tests-und-github-ci.md).

## Docs

Nach jeder Anpassung die Checkliste in [docs/phasenplan.md](./docs/phasenplan.md) setzen. Neuer wichtiger Scope, der nicht im Plan stand: Punkt aufnehmen und `*(ergänzt)*` markieren.

Architekturentscheidungen: [docs/adr/](./docs/adr/README.md).
