# ADR 0007: Phasen-Branches, PRs und lebende Docs

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Das Repo wächst phasenweise. Ohne feste Git- und Doc-Regel vermischen sich Phasen auf `main`, und der Phasenplan läuft hinter dem Code her.

## Entscheidung

- **Eine Phase, ein Branch** von `main`, ein **PR** nach `main`. Der Maintainer reviewed und merged. Die nächste Phase startet erst danach.
- Agenten dürfen `gh` für Push und PRs nutzen. Commit-Messages beschreiben das Warum.
- **Docs sind Teil der Arbeit:** nach jeder Anpassung die Checkliste in `docs/phasenplan.md` setzen. Neuer wichtiger Scope, der nicht im Plan stand: Punkt aufnehmen und mit `*(ergänzt)*` markieren.
- Verbindlich für Agenten: `AGENTS.md`. Für Menschen: `CONTRIBUTING.md`.

Der **erste Init-Push** darf direkt auf `main` (kein vorgelagerter PR).

## Konsequenzen

- `main` bleibt der geprüfte Stand.
- Phasenplan ist die lebendige Checkliste, kein einmaliges Kickoff-Dokument.
- Vitest/CI bleiben Phase 0.2; die Prozessregel gilt trotzdem ab jetzt.

## Alternativen

- **Direkt auf main arbeiten:** schneller, aber kein Review-Schnitt zwischen Phasen.
- **Docs nur am Phasenende:** zu spät, Stand und Plan laufen auseinander.
