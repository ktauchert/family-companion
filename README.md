# Family Companion

Gemeinsame Haushalts-App für Web (Next.js) und Android (Expo): Kalender, Todos, Einkaufslisten, Morgen-Check-in. Pro ergänzt KI-Priorisierung, Per-Member-Habits und Smart Shopping.

Types, Zod-Schemas und Firestore-Konstanten liegen in `@family-companion/shared`.

## Stand

Phase **2** erledigt — Alltag ([02-alltag](docs/phasen/02-alltag.md)) plus UX **2.1–2.5** (Heute, Kalender/Todos, Listen, Shell, Landing-Scaffold; PRs [#44](https://github.com/ktauchert/family-companion/pull/44)–[#48](https://github.com/ktauchert/family-companion/pull/48)). Web: öffentliche Landing `/`, App unter `(app)/…` mit Chrome. Nächster Block: [Phase 3 — Pro-Trigger](docs/phasen/03-pro-trigger.md).

Phase 1 ([01-auth-haushalt](docs/phasen/01-auth-haushalt.md)) und **1.1** Dev-Build + Google nativ ([01.1](docs/phasen/01.1-dev-build-google-native.md)). App in Expo Go: E-Mail; Google nur im Dev-Build ([ADR 0009](docs/adr/0009-auth-google-und-email.md)). Join: PIN + E-Mail-Whitelist ([ADR 0010](docs/adr/0010-invite-pin-und-email-whitelist.md)). Lessons: [docs/lessons-learned.md](docs/lessons-learned.md).

Produkt: [docs/features.md](docs/features.md) · Plan: [docs/phasenplan.md](docs/phasenplan.md)

## Stack

- Turborepo, **npm** Workspaces (kein pnpm)
- Next.js 15 (Web), Expo 57 / Expo Router (Mobile)
- Firebase Auth + Firestore
- Vitest + GitHub Actions ([ADR 0002](docs/adr/0002-unit-tests-und-github-ci.md))

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
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
# Firebase-Werte eintragen (Console → Projekteinstellungen)
# Firestore-Regeln aus firestore.rules in der Console veröffentlichen
npm run type-check
```

Dev-Scripts:

```bash
npm run dev          # Web + Mobile über Turbo
npm run dev:web      # nur Next.js → http://localhost:3000
npm run dev:mobile   # Expo interaktiv, QR im Terminal → Expo Go
```

`dev:mobile` geht absichtlich nicht über Turbo: sonst fehlt das Expo-Menü und der QR-Code. Port 8081 muss frei sein (kein zweites `expo start`).

Weitere Scripts: `npm run test`, `npm run build`, `npm run lint`.

## Mitwirken

Pro Phase ein Branch, PR nach `main`. Siehe [CONTRIBUTING.md](./CONTRIBUTING.md) und [AGENTS.md](./AGENTS.md).

## Docs

| Dokument | Inhalt |
| --- | --- |
| [docs/features.md](docs/features.md) | Produktkatalog |
| [docs/phasenplan.md](docs/phasenplan.md) | Phasen-Index |
| [docs/phasen/](docs/phasen/00.1-app-scaffolds.md) | Arbeitspakete pro Phase |
| [docs/user-journey.md](docs/user-journey.md) | Julian / Sophie |
| [docs/design/ui.md](docs/design/ui.md) | UI: Art Paper / Stone, Karten, Wireframes |
| [docs/adr/](docs/adr/README.md) | Architekturentscheidungen |
