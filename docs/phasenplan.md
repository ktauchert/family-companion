# Phasenplan

Index. Jede Phase hat eine eigene Datei mit Arbeitspaketen unter [phasen/](./phasen/).

Quellen: [features.md](./features.md), [user-journey.md](./user-journey.md), [design/ui.md](./design/ui.md), [adr/](./adr/README.md) (Invite: [0010](./adr/0010-invite-pin-und-email-whitelist.md)), [lessons-learned.md](./lessons-learned.md).

**Lebendiger Stand:** Haken in der *Phasen-Datei* setzen. Neuer Scope: Punkt dort aufnehmen und `*(ergänzt)*` markieren ([ADR 0007](./adr/0007-phasen-branches-und-docs.md)).

**Git:** Pro Phase ein Branch, PR nach `main`. Maintainer reviewed und merged, danach die nächste Phase.

| Phase | Status | Datei |
| --- | --- | --- |
| 0 Monorepo-Gerüst | erledigt | [00-monorepo.md](./phasen/00-monorepo.md) |
| 0.1 App-Scaffolds | erledigt | [00.1-app-scaffolds.md](./phasen/00.1-app-scaffolds.md) |
| 0.2 Tests und CI | erledigt | [00.2-tests-ci.md](./phasen/00.2-tests-ci.md) |
| **1 Auth & Haushalt** | erledigt | [01-auth-haushalt.md](./phasen/01-auth-haushalt.md) |
| **1.1 Dev-Build & Google nativ** | erledigt | [01.1-dev-build-google-native.md](./phasen/01.1-dev-build-google-native.md) |
| 2 Alltag | erledigt | [02-alltag.md](./phasen/02-alltag.md) |
| **2.1 Heute UX** | offen | [02.1-heute-ux.md](./phasen/02.1-heute-ux.md) · Milestone [Phase 2.1](https://github.com/ktauchert/family-companion/milestone/1) |
| **2.2 Kalender & Todos UX** | offen | [02.2-kalender-todos-ux.md](./phasen/02.2-kalender-todos-ux.md) · Milestone [Phase 2.2](https://github.com/ktauchert/family-companion/milestone/2) |
| **2.3 Listen UX** | offen | [02.3-listen-ux.md](./phasen/02.3-listen-ux.md) · Milestone [Phase 2.3](https://github.com/ktauchert/family-companion/milestone/3) |
| **2.4 Haushalt, Nav & Shell** | offen | [02.4-haushalt-nav-shell.md](./phasen/02.4-haushalt-nav-shell.md) · Milestone [Phase 2.4](https://github.com/ktauchert/family-companion/milestone/4) |
| **2.5 Landing (Scaffold)** | offen | [02.5-landing-scaffold.md](./phasen/02.5-landing-scaffold.md) · Milestone [Phase 2.5](https://github.com/ktauchert/family-companion/milestone/5) |
| 3 Pro-Trigger | offen | [03-pro-trigger.md](./phasen/03-pro-trigger.md) |
| 4 Pro: KI & Habits | offen | [04-pro-ki-habits.md](./phasen/04-pro-ki-habits.md) |

## Qualitätssicherung

| Wann | Was |
| --- | --- |
| Phase 0 | Vitest + CI entschieden, kein CD ([ADR 0002](./adr/0002-unit-tests-und-github-ci.md)) |
| Phase 0.2 / 1 | Vitest, `turbo test`, Actions |
| Phase 1.1 | Android Dev-Build; natives Google E2E ([01.1](./phasen/01.1-dev-build-google-native.md)) |
| Vor jeder persistierten Entity | CRUD-Einschätzung (C/R/U/D) an den Maintainer und ins Phasen-WP, bevor Store/UI gebaut werden ([AGENTS.md](../AGENTS.md), [lessons-learned.md](./lessons-learned.md)). Phase 2: [phase-2-crud-roles.md](./design/phase-2-crud-roles.md) |
| Phase 2 | Tests für Priorisierungs-Algo und Listen-Kategorien; CRUD je Collection (Events, Todos, Listenpunkte) |
| Phase 2+ | E2E Web (Playwright) |
| Deploybar | CD — eigenes ADR |

## Offene Entscheidungen (später)

- **Landing Design (Marketing)** — nach [02.5 Scaffold](./phasen/02.5-landing-scaffold.md); finales Visual Pre-Launch
- Kalender-Import (Google/Outlook) — eigenes ADR
- Payment-Provider für Pro
- Domain / Branding (Platzhalter: family-app.com)
- Tages-Energie-Budget (Rest-Energie im Verlauf) — [ADR 0012](./adr/0012-tages-energie-budget.md), Arbeit Phase 4 WP3
