# ADR 0012: Tages-Energie-Budget — IST, Forecast, 10×-Skala

- Status: Accepted
- Datum: 2026-09-15 (Phase-2-Teil); ergänzt 2026-09-18 (Phase-4-Entscheidungen)
- Ergänzt: [ADR 0005](./0005-morgen-check-in-und-priorisierung.md), [ADR 0011](./0011-morgen-priorisierung-vorschlaege.md)
- Umsetzung: [04-pro-ki-habits.md](../phasen/04-pro-ki-habits.md) WP3

## Kontext

Der Morgen-Check-in erfasst Stimmung und Energie **einmal pro Tag** ([ADR 0005](./0005-morgen-check-in-und-priorisierung.md)). Phase 2 speichert Werte auf 1–5 (UI: drei Stufen → 1 / 3 / 5).

Die Skala 1–5 ist für Addition und Subtraktion im Tagesverlauf **zu grob** (z. B. „mittlere Aktivität kostet 3“ würde bei Startwert 3 den Tag sofort leeren). Phase 4 führt deshalb eine **interne Budget-Skala 0–50** ein (10× der Check-in-Stufen).

`energyHint` am Item beschreibt den **geschätzten Aufwand**, nicht den Rest der Person. Das Budget verbindet Check-in, Items und (später) Erledigungen zu zwei Kennzahlen:

- **IST** — verbleibende Energie nach dem bisherigen Tagesverbrauch
- **Forecast** — Summe des erwarteten Verbrauchs **aller** heutigen Aufgaben/Termine

So sehen Mensch und Programm **vorher**, ob der Tag passt, überbucht ist oder Entlastung nötig ist.

Phase 2 priorisiert nur mit dem **Morgen-Snapshot** ([ADR 0011](./0011-morgen-priorisierung-vorschlaege.md)).

## Entscheidung

### Phase 2 (umgesetzt)

| Thema | Verhalten |
| --- | --- |
| **Check-in UI** | Drei Buttons je Stimmung und Energie; Speichern legt den Tageswert an |
| **Nach erstem Speichern** | Check-in auf Heute ausgeblendet — kein Bearbeiten in der Tagesansicht |
| **Persistenz** | `morning_checkins`: `mood` und `energy` als Zahl (1 / 3 / 5) |
| **Priorisierung** | Gespeicherter Morgenwert den ganzen Tag; keine Anpassung beim Abhaken |
| **`energyHint`** | Statisch am Event/Todo (`low` \| `medium` \| `high`), Default `medium` |

### Phase 4 — Tages-Energie-Budget

| Thema | Entscheidung |
| --- | --- |
| **Persistenz** | **Nur berechnet** — kein `remainingEnergy` in Firestore |
| **Budget-Skala** | **0–50** intern; Start = Check-in-Energie × 10 (1→10, 3→30, 5→50). Check-in bleibt 1/3/5 in `morning_checkins` |
| **`energyHint` → Punkte** | Mapping in Shared (Tests); Prinzip: medium ≈ 30 Punkte Verbrauch auf der 10×-Skala — exakte Werte für low/high bei Implementierung kalibrieren |
| **Wann neu rechnen** | Beim **Heute-Load/Sync** (Tages-Replay), **nicht** optimistisch bei jedem Abhaken |
| **IST** | Start minus Verbrauch aus **erledigten** Items des Tages (für den betrachteten User) |
| **Forecast** | Summe Verbrauch **aller** heutigen Items (Termine + Todos), unabhängig vom Erledigungsstand |
| **UI Free** | Heute zeigt IST + Forecast (Überbuchung wenn Forecast > Start) |
| **UI Pro** | KI und feinere Priorisierung nutzen zusätzlich IST/Forecast ([ADR 0013](./0013-ki-priorisierung-und-briefing.md)) |
| **Free-Algo** | Kann IST/Forecast einbeziehen; Morgen-Snapshot allein bleibt Fallback ohne Check-in |

**Noch bei Implementierung zu kalibrieren** *(nicht blockierend für ADR)*:

- Ob Termine mit Dauer stärker gewichtet werden als Todos
- Ob `energyHint: low` entlastet oder nur wenig kostet
- Haushalts-Aggregation für Partner-Vorschläge (Minimum pro Person vs. niedrigster im Haushalt)

## Konsequenzen

- Phase 2 bleibt erklärbar: kein Budget in Phase 2.
- Shared-Modul `morning/energy-budget.ts` (o. ä.) mit Vitest inkl. Überbuchung und leerem Tag.
- UI-Copy: Nutzer sehen Budget in verständlicher Form (nicht rohe 0–50-Zahl ohne Kontext — z. B. Balken oder „passt / knapp / zu viel“).
- KI-Briefing erhält IST, Forecast und Check-ins als Input.

## Alternativen

- **Skala 1–5 beibehalten:** zu grob für sinnvolle Subtraktion — verworfen.
- **Persistiertes `remainingEnergy`:** unnötige Sync-Komplexität — verworfen (nur berechnet).
- **Sofortiges Update beim Abhaken:** widerspricht Tages-Replay — verworfen.
- **Budget nur Pro:** Rest-Anzeige soll auch Free helfen — IST/Forecast Free, Verfeinerung Pro.
