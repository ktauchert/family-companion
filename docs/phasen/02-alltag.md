# Phase 2 — Alltag: Kalender, Todos, Listen, Morgen (Free)

- Status: **erledigt** *(gemerged [PR #11](https://github.com/ktauchert/family-companion/pull/11), 2026-09-15)*
- Branch: `phase-2-alltag` *(geschlossen)*
- Ergebnis: Gemeinsamer Alltag auf Web und Mobile, Morgen-Dashboard per Algo
- ADRs: [0003](../adr/0003-kalender-und-todos-sind-kern.md), [0004](../adr/0004-per-member-habits-und-kaizen.md), [0005](../adr/0005-morgen-check-in-und-priorisierung.md), [0006](../adr/0006-kategorisierte-einkaufslisten.md), [0011](../adr/0011-morgen-priorisierung-vorschlaege.md), [0012](../adr/0012-tages-energie-budget.md) *(Proposed: dynamisches Budget Phase 4)*
- **Grill-Entscheidungen:** 1B Algo+Vorschläge · 2B Habits ohne Kaizen · 3C Hybrid-UI · 4B `assignedTo: string[]` · 5A `energyHint` optional (Default `medium`) · 6A Wiederholung `none\|daily\|weekly` — [CONTEXT.md](../../CONTEXT.md)
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
- [x] Shared: `createdBy`, Store, `can*` + Tests (Rollen-Negativfälle)
- [x] `firestore.rules` für `calendar_events` *(nach Merge in der Console veröffentlichen)*
- [x] Events (Beginn, optional Ende)
- [x] Wiederholung, Zuweisung, `per_member`-Abhaken
- [x] Haushalts-Erledigung (`completionMode: household`)
- [x] Minimal-UI Kalender (Web + Mobile)

### WP2 — Todos

- [x] CRUD-Einschätzung Todos festhalten → [Design-Doc](../design/phase-2-crud-roles.md#todo-todos)
- [x] Shared: `createdBy`, Store, `can*` + Tests
- [x] `firestore.rules` für `todos`
- [x] Todos mit Fälligkeit, Zuweisung, Wiederholung, `per_member`
- [x] Haushalts-Erledigung (`completionMode: household`)
- [x] Minimal-UI Todos (Web + Mobile)

### WP3 — Einkaufslisten

- [x] CRUD-Einschätzung Listenpunkte festhalten → [Design-Doc](../design/phase-2-crud-roles.md#listenpunkt-shopping_items)
- [x] Shared: Store, `can*` + Tests
- [x] `firestore.rules` für `shopping_items`
- [x] Listen nach Thema (Supermarkt, Drogerie, Apotheke, Klamotten, Sonstiges)
- [x] Abhaken in Echtzeit
- [x] Add-/Check-Historie für spätere Muster *(Timestamps; voller Event-Log optional später)*
- [x] Minimal-UI Listen (Web + Mobile)

### WP4 — Morgen-Check-in und Algo

- [x] CRUD-Einschätzung Check-in → [Design-Doc](../design/phase-2-crud-roles.md#morgen-check-in-morning_checkins)
- [x] Shared: Store, `can*` + Tests (ein Check-in/Tag, kein Delete)
- [x] `firestore.rules` für `morning_checkins`
- [x] Check-in: Stimmung + Energie (je drei Buttons: Mies/Neutral/Spitze, Leer/Reicht/Voll → 1/3/5)
- [x] Check-in nach erstem Speichern auf Heute ausgeblendet (kein Bearbeiten in der Tagesansicht)
- [x] Tages-Priorisierung per Algo (Free): Sortierung + Vorschläge mit Bestätigung ([ADR 0011](../adr/0011-morgen-priorisierung-vorschlaege.md))
- [x] **Bewusst nicht Phase 2:** laufendes Energie-Budget im Tagesverlauf → [ADR 0012](../adr/0012-tages-energie-budget.md) (Phase 4)
- [x] Tests für Algo inkl. Negativfälle (kein Check-in, beide niedrig)
- [x] Minimal-UI Check-in + Heute-Ansicht (Web + Mobile)

### WP5 — Clients (Querschnitt)

- [x] Menschenlesbare Felder überall (Zuweisung, Thema, Zeiten, Erledigt-Status) — [Design-Doc](../design/phase-2-crud-roles.md#ui--menschen-lesen-r)
- [x] Navigation/Tabs konsistent; gleiche Collections Web + App

## Definition of Done (Phase 2)

- [x] Vier Collections mit Rules + Shared-Stores; Web und App gleicher Datenstand
- [x] Rollen: Inhaber kann fremde Alltags-Items löschen; Mitglied nur eigene; Check-in nicht löschbar
- [x] Morgen-Algo (Free) mit Tests
- [x] Docs: Haken hier; [features.md](../features.md) bei Bedarf
- [x] `firestore.rules` in Firebase Console veröffentlichen *(nach jedem Rules-Merge)*

## UX-Nachzüge (2.1–2.5, nach PR #11)

Kern-Alltag oben; danach eigene Phasen mit Milestones:

- [x] [2.1 Heute UX](./02.1-heute-ux.md) · PR [#44](https://github.com/ktauchert/family-companion/pull/44)
- [x] [2.2 Kalender & Todos UX](./02.2-kalender-todos-ux.md) · PR [#45](https://github.com/ktauchert/family-companion/pull/45)
- [x] [2.3 Listen UX](./02.3-listen-ux.md) · PR [#46](https://github.com/ktauchert/family-companion/pull/46)
- [x] [2.4 Haushalt, Nav & Shell](./02.4-haushalt-nav-shell.md) · PR [#47](https://github.com/ktauchert/family-companion/pull/47)
- [x] [2.5 Landing (Scaffold)](./02.5-landing-scaffold.md) · PR [#48](https://github.com/ktauchert/family-companion/pull/48)
