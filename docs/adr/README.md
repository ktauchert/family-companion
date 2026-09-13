# Architecture Decision Records

Hier halten wir Architekturentscheidungen fest — kurz, datiert, mit Status. Eine Entscheidung pro Datei. Ältere ADRs werden nicht umgeschrieben; eine neue Entscheidung ersetzt sie und setzt den alten Status auf `Superseded`.

## Format

Dateiname: `NNNN-kurz-titel.md` (vierstellige Nummer, klein, Bindestriche).

```markdown
# ADR NNNN: Titel

- Status: Proposed | Accepted | Superseded | Deprecated
- Datum: YYYY-MM-DD
- Ersetzt: ADR NNNN (nur wenn nötig)

## Kontext

Warum müssen wir jetzt entscheiden?

## Entscheidung

Was gilt ab jetzt?

## Konsequenzen

Was wird einfacher, was wird teurer, was kommt später?

## Alternativen

Was haben wir verworfen — und warum?
```

## Index

| ADR | Titel | Status |
| --- | --- | --- |
| [0001](./0001-npm-workspaces.md) | npm Workspaces statt pnpm | Accepted |
| [0002](./0002-unit-tests-und-github-ci.md) | Unit Tests (Vitest) und GitHub CI | Accepted |
| [0003](./0003-kalender-und-todos-sind-kern.md) | Kalender und Todos sind Kern | Accepted |
| [0004](./0004-per-member-habits-und-kaizen.md) | Per-Member-Erledigung und Kaizen-Habits | Accepted |
| [0005](./0005-morgen-check-in-und-priorisierung.md) | Morgen-Check-in und Priorisierung | Accepted |
| [0006](./0006-kategorisierte-einkaufslisten.md) | Kategorisierte Listen und Smart Shopping | Accepted |
| [0007](./0007-phasen-branches-und-docs.md) | Phasen-Branches, PRs und lebende Docs | Accepted |
