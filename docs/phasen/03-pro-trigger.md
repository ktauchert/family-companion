# Phase 3 — Pro-Upgrade-Trigger

- Status: **erledigt** — PR [#49](https://github.com/ktauchert/family-companion/pull/49)
- Branch: `phase-3-pro-trigger` (merged)
- Ergebnis: Pro ist sichtbar, kaufbar (Feld), Limit fällt

## Arbeitspakete

### WP1 — UI-Trigger

- [x] Ausgegraute Pro-Flächen: KI-Plan, Per-Member-Habits, Smart Shopping

### WP2 — Plan-Feld

- [x] `plan: "pro"` am Household
- [x] Mitgliedslimit für Pro aufheben (Member-CRUD aus Phase 1 bleibt: E-Mail sichtbar, Entfernen/Austreten)

Payment-Provider bleibt offen (eigenes ADR).

## CRUD — `Household.plan`

| | Einschätzung |
| --- | --- |
| **C** | `plan: 'free'` bei Haushalts-Anlage (`startHousehold`) — bleibt unverändert |
| **R** | Plan in Haushalt/Mehr (`Plan {plan}`) und Settings sichtbar; nach Upgrade für alle Mitglieder lesbar |
| **U** | Nur **Inhaber** setzt `plan` von `free` auf `pro` (Shared-Validierung + Firestore-Rule); kein Downgrade in Phase 3 |
| **D** | Kein Plan-Löschen; Downgrade später (Payment/Phase 4+) |

Member-CRUD aus Phase 1 bleibt: E-Mail sichtbar, Entfernen/Austreten unverändert. Bei `pro` entfällt das Free-Limit (2 Personen) für Invite/Join.
