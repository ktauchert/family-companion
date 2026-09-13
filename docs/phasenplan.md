# Phasenplan

Wir arbeiten die App schrittweise aus. Jede Phase hat ein klar abgegrenztes Ergebnis.

Quellen: [features.md](./features.md), [user-journey.md](./user-journey.md), [monorepo-struktur.md](./monorepo-struktur.md), [adr/](./adr/README.md).

**Diese Checkliste ist der lebendige Stand.** Nach jeder Anpassung Haken setzen. Neuer wichtiger Scope, der hier nicht stand: Punkt aufnehmen und `*(ergänzt)*` markieren ([ADR 0007](./adr/0007-phasen-branches-und-docs.md)).

**Git:** Pro Phase ein Branch, PR nach `main`. Maintainer reviewed und merged, danach die nächste Phase.

---

## Phase 0 — Monorepo-Gerüst (aktuell)

**Ergebnis:** Turborepo + npm Workspaces, Shared-Package, Docs.

- [x] Root mit npm Workspaces und `turbo.json`
- [x] `packages/shared` (Types, Zod, Firebase-Konstanten)
- [x] `packages/config-typescript`
- [x] Platzhalter `apps/web` und `apps/mobile`
- [x] Notizen nach `docs/`
- [x] ADR-Ordner (`docs/adr/`)
- [x] Testing- und CI-Entscheidung festgehalten ([ADR 0002](./adr/0002-unit-tests-und-github-ci.md))
- [x] Kalender, Todos, Habits, Check-in, Listen in Docs/ADRs ([ADR 0003](./adr/0003-kalender-und-todos-sind-kern.md)–[0006](./adr/0006-kategorisierte-einkaufslisten.md))
- [x] `AGENTS.md` (Tests inkl. Negativfälle, `gh`, Phasen-PRs, Docs-Checkliste) *(ergänzt)*
- [x] `CONTRIBUTING.md` und README *(ergänzt)*
- [x] Phasen-Branches und lebende Docs ([ADR 0007](./adr/0007-phasen-branches-und-docs.md)) *(ergänzt)*
- [x] GitHub-Remote, erster Push auf `main` *(ergänzt)*
- [x] Matt-Pocock-Skills-Setup: GitHub Issues, single-context (`docs/agents/`) *(ergänzt)*

---

## Phase 0.1 — App-Scaffolds

**Ergebnis:** Lauffähige leere Next.js- und Expo-Apps im Monorepo, beide importieren `@family-companion/shared`.

- [ ] Next.js in `apps/web` (App Router)
- [ ] Expo + Expo Router in `apps/mobile`
- [ ] Gemeinsame Dev-Scripts über Turbo prüfen

---

## Phase 0.2 — Tests und GitHub CI

Gilt [ADR 0002](./adr/0002-unit-tests-und-github-ci.md). Gerüst erst anlegen, wenn Shared testbare Logik hat bzw. das Repo auf GitHub liegt.

- [ ] Vitest in `@family-companion/shared`
- [ ] Root-Script `test` → `turbo test`
- [ ] GitHub Actions: `npm ci`, `type-check`, `test` (Push/PR)
- [ ] Erste Tests für Schemas, Limits, später Priorisierungs-Algo — inkl. Negativfälle

Noch nicht: CD (Deploy), E2E.

---

## Phase 1 — Auth & Haushalt (Free)

Entspricht User-Journey Phase 1.

- [ ] Firebase-Projekt + Google Auth (Web + Android)
- [ ] Haushalt anlegen (Onboarding)
- [ ] Einladungs-Link / QR-Code
- [ ] Auto-Join zweites Mitglied
- [ ] Free-Tier-Limit: max. 2 Mitglieder

---

## Phase 2 — Alltag: Kalender, Todos, Listen, Morgen (Free)

Entspricht User-Journey Phase 2. Kern laut [ADR 0003](./adr/0003-kalender-und-todos-sind-kern.md), [0005](./adr/0005-morgen-check-in-und-priorisierung.md), [0006](./adr/0006-kategorisierte-einkaufslisten.md).

- [ ] Kalender (Events, Wiederholung, Zuweisung)
- [ ] Todos (Haushalts-Erledigung, Zuweisung, Fälligkeit)
- [ ] Einkaufslisten nach Thema (Supermarkt, Drogerie, Apotheke, Klamotten, Sonstiges)
- [ ] Add-/Check-Historie für spätere Muster
- [ ] Morgen-Check-in (Stimmung, Energie)
- [ ] Tages-Priorisierung per Algo (Free)
- [ ] Web-Dashboard und Mobile-Tabs auf denselben Collections

---

## Phase 3 — Pro-Upgrade-Trigger

Entspricht User-Journey Phase 3.

- [ ] Ausgegraute Pro-Flächen: KI-Plan, Per-Member-Habits, Smart Shopping
- [ ] `plan: "pro"` am Household
- [ ] Mitgliedslimit für Pro aufheben

---

## Phase 4 — Pro: KI, Habits, Smart Shopping

Entspricht User-Journey Phase 4. [ADR 0004](./adr/0004-per-member-habits-und-kaizen.md).

- [ ] Per-Member-Erledigung an Events/Todos
- [ ] Tägliche Pflicht-Habits, prominent am Start
- [ ] Kaizen-/Ikigai-Nudge bei verpasstem Tag (abschaltbar)
- [ ] KI-Priorisierung + `/api/ai/daily-summary` (Check-ins, Kalender, Todos, Listen)
- [ ] Smart Shopping: KI-Freitext *und* Muster aus Listen (Algo bleibt auch Free nutzbar)
- [ ] Verschieben / dem anderen zuweisen als bestätigter Vorschlag

---

## Qualitätssicherung (über alle Phasen)

| Wann | Was |
| --- | --- |
| Phase 0 | Entscheidung: Vitest + GitHub CI, kein CD ([ADR 0002](./adr/0002-unit-tests-und-github-ci.md)) |
| Phase 0.2 / 1 | Vitest, `turbo test`, Actions-Workflow, Tests an Shared-Logik |
| Phase 2 | Unit-Tests für Priorisierungs-Algo und Listen-Kategorien |
| Phase 2+ | E2E Web (Playwright), wenn Auth und Listen stehen |
| Deploybar | CD (Vercel / EAS) — eigenes ADR |

---

## Offene Entscheidungen (später)

- Kalender-Import (Google/Outlook) — eigenes ADR
- Payment-Provider für Pro
- Domain / Branding (Platzhalter: family-app.com)
