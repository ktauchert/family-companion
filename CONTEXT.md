# Domain-Glossar (Family Companion)

Zentrale Begriffe für Code, Issues und Docs. Ergänzt durch `/grill-with-docs` und `/domain-modeling`.

## Rollen

| Begriff | Bedeutung | Nicht verwenden für |
| --- | --- | --- |
| **Inhaber** | `auth.uid === household.ownerId`. Verwaltet Menschen (Phase 1) und darf fremde Alltags-Items löschen (Phase 2). | „Owner“ in UI-Copy (Deutsch) |
| **Haushaltsmitglied** | Jeder Eintrag in `household.members` (Inhaber eingeschlossen). | — |
| **Mitglied (nicht-Inhaber)** | Haushaltsmitglied, das nicht Inhaber ist. Eingeschränktes Löschen fremder Items. | „Mitglied“ ohne Kontext, wenn Inhaber gemeint sein könnte |

## Alltag (Phase 2)

| Begriff | Bedeutung |
| --- | --- |
| **Haushalts-Erledigung** | `completionMode: 'household'` — ein Abhaken gilt für den ganzen Haushalt. |
| **Per-Member-Erledigung** | `completionMode: 'per_member'` — jedes Haushaltsmitglied hakt für sich ab (Free, normale Todos/Events). |
| **Habit** | Wiederkehrender Todo oder Kalender-Eintrag (`kind: 'habit'`, `recurrence: daily \| weekly`). **Kalender:** zeitgebunden, für Haushalt in der KW sichtbar; **Todo:** Aufgabe ohne festen Slot. Abhaken: Kalender nur im View-Modal, Todo auch auf der Card. Completions für Phase 4 (Kaizen/LLM). **Keine** Kaizen-Nudges in Phase 2. |
| **Pflicht-Habit** | `mandatoryDaily: true` — Pro-Feature (Kaizen); **nicht** in Phase 2 UI. |
| **Zuweisung** | `assignedTo: string[]` — auf Kalender-Events **und** Todos; leer oder fehlend = niemand speziell zugewiesen (Haushalt). |
| **Energie-Hinweis** | `energyHint: 'low' \| 'medium' \| 'high'` — optional im Formular, Default `medium` wenn nicht gesetzt. |
| **Wiederholung** | `recurrence: 'none' \| 'daily' \| 'weekly'` — kein Wochentag, kein Enddatum in Phase 2. |

## Priorisierung

| Begriff | Bedeutung |
| --- | --- |
| **Morgen-Check-in** | Stimmung + Energie pro Nutzer und Kalendertag (`morning_checkins`). UI: drei Stufen je Feld (→ 1/3/5 gespeichert); nach Speichern **Check-in-Chip** auf Heute (Phase 2.1). |
| **Morgen-Snapshot** | Gespeicherter Check-in-Wert für den Tag — Phase-2-Algo nutzt ihn **ohne** Anpassung beim Abhaken von Tasks. |
| **Tages-Energie-Budget** | *Geplant Phase 4* ([ADR 0012](./docs/adr/0012-tages-energie-budget.md)): Rest-Energie im Tagesverlauf aus Check-in + `energyHint`/Erledigungen. |
| **Morgen-Priorisierung** | Deterministischer Free-Algo: sortiert die Tagesansicht und erzeugt **Vorschläge** (siehe ADR 0011). |
| **Einkaufs-Muster** | Separater Algo (ADR 0006): Vorschläge aus Häufigkeit/Abstand beim Einkauf — später, nicht Teil der Morgen-Priorisierung. |
| **Vorschlag** | Vom Algo berechnet, **nicht** in Firestore persistiert. Nutzer bestätigt → Update am Todo/Event (z. B. Fälligkeit verschieben, Zuweisung ändern). |

## Phase-2-Arbeitsweise

- **Hybrid-UI (3C):** Pro Arbeitspaket: Shared Store + Rules + Tests, danach Minimal-UI Web + Mobile für dieselbe Entity.
- **Morgen-Algo (1B):** Sortierung **und** sichtbare Vorschläge; keine automatische Änderung ohne Bestätigung.
- **Zuweisung (4B):** `assignedTo` überall `string[]`.
- **Energie-Hinweis (5A):** optional in UI, Default `medium`.
- **Wiederholung (6A):** Enum `none | daily | weekly` reicht für Phase 2.

## Quellen

- [phase-2-crud-roles.md](docs/design/phase-2-crud-roles.md)
- [02.1-heute-ux.md](docs/phasen/02.1-heute-ux.md) · [02.2-kalender-todos-ux.md](docs/phasen/02.2-kalender-todos-ux.md) · [02.3-listen-ux.md](docs/phasen/02.3-listen-ux.md)
- [02-alltag.md](docs/phasen/02-alltag.md)
- ADR [0004](docs/adr/0004-per-member-habits-und-kaizen.md), [0005](docs/adr/0005-morgen-check-in-und-priorisierung.md), [0011](docs/adr/0011-morgen-priorisierung-vorschlaege.md)
