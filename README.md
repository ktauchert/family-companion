# Family Companion

Gemeinsame Haushalts-App für Web (Next.js) und Android (Expo): Kalender, Todos, Einkaufslisten, Morgen-Check-in. Pro ergänzt KI-Priorisierung, Per-Member-Habits und Smart Shopping.

Types, Zod-Schemas und Firestore-Konstanten liegen in `@family-companion/shared`.

## Stand

Phase 0: Monorepo-Gerüst, Docs, ADRs. Next.js- und Expo-Apps folgen in Phase 0.1.

Produkt: [docs/features.md](docs/features.md) · Plan: [docs/phasenplan.md](docs/phasenplan.md)

## Stack

- Turborepo, **npm** Workspaces (kein pnpm)
- Next.js 15 (Web), Expo / Expo Router (Mobile) — Scaffolds offen
- Firebase Auth + Firestore
- Vitest + GitHub Actions — entschieden, noch nicht eingebaut ([ADR 0002](docs/adr/0002-unit-tests-und-github-ci.md))

## Struktur

```text
family-companion/
├── apps/web                 # Next.js — Phase 0.1
├── apps/mobile              # Expo — Phase 0.1
├── packages/shared          # Types, Schemas, Konstanten
├── packages/config-typescript
├── docs/                    # Features, Journey, Phasenplan, ADRs
├── AGENTS.md
└── CONTRIBUTING.md
```

## Setup

Node.js 20+, npm.

```bash
npm install
cp .env.example .env.local
# Firebase-Werte eintragen (Console → Projekteinstellungen)
npm run type-check
```

Weitere Scripts: `npm run dev`, `npm run build`, `npm run lint` (Apps sind noch Platzhalter).

## Mitwirken

Pro Phase ein Branch, PR nach `main`. Siehe [CONTRIBUTING.md](./CONTRIBUTING.md) und [AGENTS.md](./AGENTS.md).

## Docs

| Dokument | Inhalt |
| --- | --- |
| [docs/features.md](docs/features.md) | Produktkatalog |
| [docs/phasenplan.md](docs/phasenplan.md) | Phasen-Index |
| [docs/phasen/](docs/phasen/00.1-app-scaffolds.md) | Arbeitspakete pro Phase |
| [docs/user-journey.md](docs/user-journey.md) | Julian / Sophie |
| [docs/adr/](docs/adr/README.md) | Architekturentscheidungen |
