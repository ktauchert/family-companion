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
| **Pflicht-Habit** | `mandatoryDaily: true` — **nur Pro** (`plan === 'pro'`). Darf `household` oder `per_member` sein. Prominent auf Heute bis erledigt. |
| **Kaizen-Nudge** | Abends, wenn Pflicht-Habit für die **Person** noch offen. Spruch aus lokaler Liste (LLM optional später). Abschaltbar **pro Mitglied** (`kaizenNudgesEnabled` am User, nicht am Household). |
| **Zuweisung** | `assignedTo: string[]` — auf Kalender-Events **und** Todos; leer oder fehlend = niemand speziell zugewiesen (Haushalt). |
| **Energie-Hinweis** | `energyHint: 'low' \| 'medium' \| 'high'` — optional im Formular, Default `medium` wenn nicht gesetzt. |
| **Wiederholung** | `recurrence: 'none' \| 'daily' \| 'weekly'` — kein Wochentag, kein Enddatum in Phase 2. |

## Priorisierung

| Begriff | Bedeutung |
| --- | --- |
| **Morgen-Check-in** | Stimmung + Energie pro Nutzer und Kalendertag (`morning_checkins`). UI: drei Stufen je Feld (→ 1/3/5 gespeichert); nach Speichern **Check-in-Chip** auf Heute (Phase 2.1). |
| **Morgen-Snapshot** | Gespeicherter Check-in-Wert (1/3/5) für den Tag — Phase-2-Algo nutzt ihn **ohne** Anpassung beim Abhaken. |
| **Tages-Energie-Budget** | Berechnet (nicht persistiert). Interne Skala **0–50** (= Check-in × 10). **IST** = Rest nach erledigten Items; **Forecast** = Summe Verbrauch aller heutigen Items. Neuberechnung beim Heute-Load. UI Free; feinere Nutzung Pro ([ADR 0012](./docs/adr/0012-tages-energie-budget.md)). |
| **Morgen-Priorisierung** | Deterministischer Free-Algo: Sortierung + **Vorschläge** (ADR 0011). Kann IST/Forecast einbeziehen. |
| **KI-Tagesbriefing** | Pro: `/api/ai/daily-summary` — Briefing + verfeinerte Vorschläge; ergänzt Free-Algo, ersetzt ihn nicht. Consent vor Call. Gleiche `PrioritizationSuggestion` + Bestätigung (ADR 0013). |
| **Einkaufs-Muster** | Free-Algo (ADR 0006): Häufigkeit/Abstand aus Listen-Historie — **nicht** LLM-Freitext. |
| **Smart Shopping (KI)** | Pro: Freitext → KI schlägt **Liste + Items** vor; Eingabe auf Heute und Listen. Bestätigung vor Anlegen. |
| **Vorschlag** | Berechnet (Algo oder KI), **nicht** persistiert. Bestätigung → normales Item-Update (`applySuggestion*`). |

## Phase-2-Arbeitsweise

- **Hybrid-UI (3C):** Pro Arbeitspaket: Shared Store + Rules + Tests, danach Minimal-UI Web + Mobile für dieselbe Entity.
- **Morgen-Algo (1B):** Sortierung **und** sichtbare Vorschläge; keine automatische Änderung ohne Bestätigung.
- **Zuweisung (4B):** `assignedTo` überall `string[]`.
- **Energie-Hinweis (5A):** optional in UI, Default `medium`.
- **Wiederholung (6A):** Enum `none | daily | weekly` reicht für Phase 2.

## Quellen

- [phase-2-crud-roles.md](docs/design/phase-2-crud-roles.md)
- [02.1-heute-ux.md](docs/phasen/02.1-heute-ux.md) · [02.2-kalender-todos-ux.md](docs/phasen/02.2-kalender-todos-ux.md) · [02.3-listen-ux.md](docs/phasen/02.3-listen-ux.md) · [02.4-haushalt-nav-shell.md](docs/phasen/02.4-haushalt-nav-shell.md) · [02.5-landing-scaffold.md](docs/phasen/02.5-landing-scaffold.md)
- [02-alltag.md](docs/phasen/02-alltag.md)
- ADR [0004](docs/adr/0004-per-member-habits-und-kaizen.md), [0005](docs/adr/0005-morgen-check-in-und-priorisierung.md), [0011](docs/adr/0011-morgen-priorisierung-vorschlaege.md), [0012](docs/adr/0012-tages-energie-budget.md), [0013](docs/adr/0013-ki-priorisierung-und-briefing.md)
- [04-pro-ki-habits.md](docs/phasen/04-pro-ki-habits.md)
