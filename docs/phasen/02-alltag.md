# Phase 2 — Alltag: Kalender, Todos, Listen, Morgen (Free)

- Status: **offen**
- Branch: `phase-2-alltag` *(von `main` nach Merge [PR #4](https://github.com/ktauchert/family-companion/pull/4))*
- Ergebnis: Gemeinsamer Alltag auf Web und Mobile, Morgen-Dashboard per Algo
- ADRs: [0003](../adr/0003-kalender-und-todos-sind-kern.md), [0005](../adr/0005-morgen-check-in-und-priorisierung.md), [0006](../adr/0006-kategorisierte-einkaufslisten.md)
- **CRUD & Rollen:** [phase-2-crud-roles.md](../design/phase-2-crud-roles.md) *(ergänzt)*

## Architektur (Alltag)

- **Persistenz:** Firestore über Stores in `@family-companion/shared` (wie `householdStore`) — Web und App binden nur `db`.
- **Keine Next.js-API** für Kalender/Todos/Listen/Check-in; Regeln in `firestore.rules` + Shared-Validierung.
- **Rollen:** Inhaber (`ownerId`) vs Mitglied — kooperatives C/R/U für alle; **Löschen** fremder Inhalte nur Inhaber (Details in Design-Doc).
- **Clients:** Expo Go + E-Mail/Passwort für Mobile-Dev; Google unverändert nur Dev-Build.

## Arbeitspakete

Vor jedem Store: CRUD-Einschätzung — **[phase-2-crud-roles.md](../design/phase-2-crud-roles.md)** *(erledigt)*.

| Entity | C | R | U | D | Rollen |
| --- | --- | --- | --- | --- | --- |
| Kalender-Event | ✓ | ✓ | ✓ | ✓ | D: Inhaber alles, Mitglied nur eigene |
| Todo | ✓ | ✓ | ✓ | ✓ | wie Event |
| Listenpunkt | ✓ | ✓ | ✓ | ✓ | D: Inhaber alles, Mitglied nur `addedBy` |
| Morgen-Check-in | ✓ (self) | ✓ | ✓ (self, selber Tag) | ✗ | privat, kein Admin-Delete |

### WP1 — Kalender

- [x] CRUD-Einschätzung Events festhalten → [Design-Doc](../design/phase-2-crud-roles.md#kalender-event-calendar_events)
- [ ] Shared: `createdBy`, Store, `can*` + Tests (Rollen-Negativfälle)
- [ ] `firestore.rules` für `calendar_events`
- [ ] Events (Beginn, optional Ende)
- [ ] Wiederholung, Zuweisung
- [ ] Haushalts-Erledigung (eine Person hakte für alle)

### WP2 — Todos

- [x] CRUD-Einschätzung Todos festhalten → [Design-Doc](../design/phase-2-crud-roles.md#todo-todos)
- [ ] Shared: `createdBy`, Store, `can*` + Tests
- [ ] `firestore.rules` für `todos`
- [ ] Todos mit Fälligkeit und Zuweisung
- [ ] Haushalts-Erledigung

### WP3 — Einkaufslisten

- [x] CRUD-Einschätzung Listenpunkte festhalten → [Design-Doc](../design/phase-2-crud-roles.md#listenpunkt-shopping_items)
- [ ] Shared: Store, `can*` + Tests
- [ ] `firestore.rules` für `shopping_items`
- [ ] Listen nach Thema (Supermarkt, Drogerie, Apotheke, Klamotten, Sonstiges)
- [ ] Abhaken in Echtzeit
- [ ] Add-/Check-Historie für spätere Muster *(Timestamps; voller Event-Log optional später)*

### WP4 — Morgen-Check-in und Algo

- [x] CRUD-Einschätzung Check-in → [Design-Doc](../design/phase-2-crud-roles.md#morgen-check-in-morning_checkins)
- [ ] Shared: Store, `can*` + Tests (ein Check-in/Tag, kein Delete)
- [ ] `firestore.rules` für `morning_checkins`
- [ ] Check-in: Stimmung + Energie
- [ ] Tages-Priorisierung per Algo (Free)
- [ ] Tests für Algo inkl. Negativfälle (kein Check-in, beide niedrig)

### WP5 — Clients

- [ ] Web-Dashboard und Mobile-Tabs auf denselben Collections
- [ ] UI: menschenlesbare Felder (Zuweisung, Thema, Zeiten) — [Design-Doc](../design/phase-2-crud-roles.md#ui--menschen-lesen-r)

## Definition of Done (Phase 2)

- Vier Collections mit Rules + Shared-Stores; Web und App gleicher Datenstand
- Rollen: Inhaber kann fremde Alltags-Items löschen; Mitglied nur eigene; Check-in nicht löschbar
- Morgen-Algo (Free) mit Tests
- Docs: Haken hier; [features.md](../features.md) bei Bedarf
