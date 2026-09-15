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

## Persistenz: CRUD vor der Umsetzung

Bevor Store, Rules oder UI für eine **gespeicherte** Entity gebaut oder erweitert werden: **Einschätzung an den User**, parallel ins aktuelle Phasen-WP. Nicht erst nach dem ersten Happy-Path.

Je Buchstabe: nötig / nicht nötig, wer darf, welches Feld der Mensch sehen oder ändern muss.

| | Frage |
| --- | --- |
| **C** | Wer legt an, mit welchem Input? Gibt es schon einen Create-Pfad (z. B. Join statt zweites Formular)? |
| **R** | Welche Felder muss ein Mensch lesen? IDs und Rollen allein reichen nicht (E-Mail, Titel, Datum). |
| **U** | Welche Felder ändern sich im Alltag? Weglassen nur mit Begründung. |
| **D** | Wer entfernt, was passiert mit Limits und Referenzen? Ohne Delete wird der Datensatz starr. |

Create+Read ohne Delete ist fast immer zu wenig (Invites nachträglich, Members in Phase 1 vergessen). Details: [lessons-learned.md](./docs/lessons-learned.md).

## Docs nachziehen

Nach jeder inhaltlichen Änderung:

1. Checkliste in der **aktuellen Phasen-Datei** unter [docs/phasen/](./docs/phasen/) aktualisieren (`[x]` / `[ ]`). Index: [docs/phasenplan.md](./docs/phasenplan.md).
2. [docs/features.md](./docs/features.md), Journey oder ADRs anfassen, wenn sich Produkt oder Architektur ändert. UI/UX: [docs/design/ui.md](./docs/design/ui.md) lesen und einhalten. Wiederholte Fallen: [docs/lessons-learned.md](./docs/lessons-learned.md).
3. Fehlt etwas Wichtiges: Arbeitspaket in der Phase **ergänzen** und mit `*(ergänzt)*` markieren.

## Technik (kurz)

- npm Workspaces, kein pnpm ([ADR 0001](./docs/adr/0001-npm-workspaces.md)).
- Shared-Code nur in `@family-companion/shared`. Firestore-Lese/Schreib (außer Auth) über `householdStore(db)` dort; Web und App binden nur ihren `db`.
- UI: Art Paper (Light) / Stone (Dark), keine Sidebar, Karten ohne linken Farbstreifen. Tokens und Wireframes: [docs/design/ui.md](./docs/design/ui.md). Vorschau: [docs/design/preview.html](./docs/design/preview.html).
- Keine Secrets committen. Vorlagen: `apps/web/.env.example`, `apps/mobile/.env.example`. Echte Werte nur in der jeweiligen `.env.local` (gitignored). OpenAI und Firebase-Admin nur serverseitig.

## Agent skills

### Issue tracker

Specs und Tickets liegen als GitHub Issues (`gh`). Siehe `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: eine `CONTEXT.md` im Root, ADRs in `docs/adr/`. Siehe `docs/agents/domain.md`.

## Copy-Paste für den Maintainer

Wenn der User Text **zum Kopieren** braucht (Init-Prompts, Befehlsblöcke, Snippets):

- **Nicht** in Markdown-Code-Fences (` ``` `) in der Chat-Antwort — Cursor hängt beim Kopieren `1 │` … an jede Zeile.
- Stattdessen: **Plaintext im Fließtext** der Antwort (ohne Fence), oder Datei im Repo nennen zum Kopieren aus dem Editor.
- Phasen-Handoffs: unter `docs/agents/` ablegen (z. B. `phase-2-init-prompt.md`); in der Antwort nur Pfad + „aus Editor kopieren“.
- Keine nummerierten Listen in Copy-Payloads — `-` nutzen.
- Erklärung getrennt vom kopierbaren Block.
