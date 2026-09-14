# Family Companion

Gemeinsame Haushalts-App für Web (Next.js) und Android (Expo): Kalender, Todos, Einkaufslisten, Morgen-Check-in. Pro ergänzt KI-Priorisierung, Per-Member-Habits und Smart Shopping.

Types, Zod-Schemas und Firestore-Konstanten liegen in `@family-companion/shared`.

## Stand

Phase 1 (in Arbeit): Haushalt und Auth. Web: Google auf `/login`, neues Konto auf `/register`. Join: PIN + E-Mail-Whitelist, kein `/join/…` ([ADR 0010](docs/adr/0010-invite-pin-und-email-whitelist.md)). In der Firebase Console muss **Authentication → E-Mail/Passwort** an sein. Nach Rule-Änderungen `firestore.rules` neu veröffentlichen. App: dieselben Flows; Google nur nativ (Dev-Build), Expo Go über E-Mail ([ADR 0009](docs/adr/0009-auth-google-und-email.md)). Lessons: [docs/lessons-learned.md](docs/lessons-learned.md).

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
