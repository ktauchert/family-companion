# Phasenplan

Index. Jede Phase hat eine eigene Datei mit Arbeitspaketen unter [phasen/](./phasen/).

Quellen: [features.md](./features.md), [user-journey.md](./user-journey.md), [adr/](./adr/README.md).

**Lebendiger Stand:** Haken in der *Phasen-Datei* setzen. Neuer Scope: Punkt dort aufnehmen und `*(ergänzt)*` markieren ([ADR 0007](./adr/0007-phasen-branches-und-docs.md)).

**Git:** Pro Phase ein Branch, PR nach `main`. Maintainer reviewed und merged, danach die nächste Phase.

| Phase | Status | Datei |
| --- | --- | --- |
| 0 Monorepo-Gerüst | erledigt | [00-monorepo.md](./phasen/00-monorepo.md) |
| 0.1 App-Scaffolds | erledigt | [00.1-app-scaffolds.md](./phasen/00.1-app-scaffolds.md) |
| **0.2 Tests und CI** | **PR offen** | [00.2-tests-ci.md](./phasen/00.2-tests-ci.md) |
| 1 Auth & Haushalt | offen | [01-auth-haushalt.md](./phasen/01-auth-haushalt.md) |
| 2 Alltag | offen | [02-alltag.md](./phasen/02-alltag.md) |
| 3 Pro-Trigger | offen | [03-pro-trigger.md](./phasen/03-pro-trigger.md) |
| 4 Pro: KI & Habits | offen | [04-pro-ki-habits.md](./phasen/04-pro-ki-habits.md) |

## Qualitätssicherung

| Wann | Was |
| --- | --- |
| Phase 0 | Vitest + CI entschieden, kein CD ([ADR 0002](./adr/0002-unit-tests-und-github-ci.md)) |
| Phase 0.2 / 1 | Vitest, `turbo test`, Actions |
| Phase 2 | Tests für Priorisierungs-Algo und Listen-Kategorien |
| Phase 2+ | E2E Web (Playwright) |
| Deploybar | CD — eigenes ADR |

## Offene Entscheidungen (später)

- Kalender-Import (Google/Outlook) — eigenes ADR
- Payment-Provider für Pro
- Domain / Branding (Platzhalter: family-app.com)
