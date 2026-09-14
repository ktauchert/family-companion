# Phase 2 — Alltag: Kalender, Todos, Listen, Morgen (Free)

- Status: **offen**
- Branch: `phase-2-alltag`
- Ergebnis: Gemeinsamer Alltag auf Web und Mobile, Morgen-Dashboard per Algo
- ADRs: [0003](../adr/0003-kalender-und-todos-sind-kern.md), [0005](../adr/0005-morgen-check-in-und-priorisierung.md), [0006](../adr/0006-kategorisierte-einkaufslisten.md)

## Arbeitspakete

Vor jedem Store: CRUD-Einschätzung (C/R/U/D) an den Maintainer und hier festhalten — [AGENTS.md](../../AGENTS.md). Phase 1 hat Members ohne D und ohne lesbare E-Mail geliefert; Kalender/Todos/Listen dürfen das nicht wiederholen.

Erwartung (kann in der Einschätzung begründet abweichen):

| Entity | C | R | U | D |
| --- | --- | --- | --- | --- |
| Kalender-Event | anlegen | Titel, Zeit, wer | ändern | löschen |
| Todo | anlegen | Titel, Fälligkeit, wer | ändern / abhaken | löschen |
| Listenpunkt | hinzufügen | Text, Thema, Status | umbenennen / abhaken | entfernen |
| Morgen-Check-in | einmal pro Tag | Stimmung, Energie | korrigieren am selben Tag | nein (Tag bleibt nachvollziehbar) |

### WP1 — Kalender

- [ ] CRUD-Einschätzung Events festhalten, dann Store + UI
- [ ] Events (Beginn, optional Ende)
- [ ] Wiederholung, Zuweisung
- [ ] Haushalts-Erledigung (eine Person hakte für alle)

### WP2 — Todos

- [ ] CRUD-Einschätzung Todos festhalten, dann Store + UI
- [ ] Todos mit Fälligkeit und Zuweisung
- [ ] Haushalts-Erledigung

### WP3 — Einkaufslisten

- [ ] CRUD-Einschätzung Listenpunkte festhalten, dann Store + UI
- [ ] Listen nach Thema (Supermarkt, Drogerie, Apotheke, Klamotten, Sonstiges)
- [ ] Abhaken in Echtzeit
- [ ] Add-/Check-Historie für spätere Muster

### WP4 — Morgen-Check-in und Algo

- [ ] Check-in: Stimmung + Energie
- [ ] Tages-Priorisierung per Algo (Free)
- [ ] Tests für Algo inkl. Negativfälle (kein Check-in, beide niedrig)

### WP5 — Clients

- [ ] Web-Dashboard und Mobile-Tabs auf denselben Collections
