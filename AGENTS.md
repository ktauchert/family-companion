# AGENTS.md

Arbeitsregeln für Agenten in diesem Repo. Menschliche Ergänzung: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Git und Phasen

- Pro **Phase** (z. B. `phase-0.1-app-scaffolds`) einen **neuen Branch** von aktuellem `main`.
- Arbeit landet per **Pull Request** nach `main`. Der Maintainer prüft den PR und merged selbst. Nicht selbst nach `main` mergen, außer es wird ausdrücklich verlangt (z. B. erster Init-Push).
- Erst weiter zur nächsten Phase, wenn der vorige PR in `main` ist.
- `gh` ist erlaubt: Branch pushen, PR anlegen, Status lesen. Commits mit klarer Message (Warum, nicht Dateiliste). Force-Push auf `main` nur auf ausdrückliche Anweisung.

## Tests

- Tests dort, wo Verhalten kippen kann: Shared-Logik, Schemas, Limits, Algos, Auth-Regeln. Nicht für reines Type-Durchreichen.
- Immer auch **Negativfälle**: ungültiges Input, falsches Tier, Limit überschritten, fremdes Haushaltsmitglied, fehlender Check-in.
- Stack laut [ADR 0002](./docs/adr/0002-unit-tests-und-github-ci.md): Vitest, `turbo test`.

## Docs nachziehen

Nach jeder inhaltlichen Änderung:

1. Checkliste in der **aktuellen Phasen-Datei** unter [docs/phasen/](./docs/phasen/) aktualisieren (`[x]` / `[ ]`). Index: [docs/phasenplan.md](./docs/phasenplan.md).
2. [docs/features.md](./docs/features.md), Journey oder ADRs anfassen, wenn sich Produkt oder Architektur ändert.
3. Fehlt etwas Wichtiges: Arbeitspaket in der Phase **ergänzen** und mit `*(ergänzt)*` markieren.

## Technik (kurz)

- npm Workspaces, kein pnpm ([ADR 0001](./docs/adr/0001-npm-workspaces.md)).
- Shared-Code nur in `@family-companion/shared`.
- Keine Secrets committen. Vorlage: `.env.example`. Echte Werte nur in `.env.local` (gitignored). OpenAI und Firebase-Admin nur serverseitig.

## Agent skills

### Issue tracker

Specs und Tickets liegen als GitHub Issues (`gh`). Siehe `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: eine `CONTEXT.md` im Root, ADRs in `docs/adr/`. Siehe `docs/agents/domain.md`.
