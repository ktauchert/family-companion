# ADR 0011: Morgen-Priorisierung — Sortierung und bestätigte Vorschläge (Free)

- Status: Accepted
- Datum: 2026-09-15
- Ergänzt: [ADR 0005](./0005-morgen-check-in-und-priorisierung.md)

## Kontext

ADR 0005 legt Check-in und energieabhängige Priorisierung fest, aber nicht, ob der Free-Algo nur sortiert oder auch Handlungsvorschläge zeigt. Für Phase 2 braucht Implementierung und Tests eine klare Grenze: Was wird berechnet, was wird gespeichert, was macht der Mensch?

## Entscheidung

**Free-Morgen-Priorisierung in Phase 2 umfasst:**

1. **Sortierung** der Tagesansicht (Heute/Morgen-Dashboard) aus Check-ins, Kalender, Todos und offenen Habits.
2. **Vorschläge** als berechnete Hinweise — z. B. „Einkaufen nach hinten“, „Partner übernimmt“ — die der Nutzer **bestätigen** muss, bevor sich Daten ändern.

**Vorschläge sind nicht persistiert.** Sie entstehen in `@family-companion/shared` als reine Funktion (Input: Haushalt, Check-ins, Events, Todos, Datum → Output: sortierte Liste + `Suggestion[]`). Bestätigung führt zu einem normalen Update am betroffenen Todo oder Event (z. B. `dueDate` verschieben, `assignedTo` ändern).

**Vorschlagstypen (Phase 2, Minimum):**

| Typ | Bedeutung | Bestätigung ändert |
| --- | --- | --- |
| `postpone` | Bei niedriger Haushalts-Energie: Aufgabe/Termin nicht für heute priorisieren | `dueDate` / sichtbare Tageszuordnung |
| `reassign` | Nur eine Person hat Energie: andere Person kann übernehmen | `assignedTo` |

**Reihenfolge (grob, testbar):**

1. Zeitgebundene Termine heute (nach `startsAt`)
2. Offene Habits mit `per_member` (eigene Erledigung fehlt)
3. Todos/Events mit passendem `energyHint` zum niedrigsten Check-in-Energielevel im Haushalt
4. Rest nach Fälligkeit / Dringlichkeit
5. Bei beiden Energie ≤ 2 (Skala 1–5): Einkauf und `energyHint: high` nach hinten; `postpone`-Vorschläge erzeugen

Ohne Check-in am Tag: neutrale Sortierung (Fälligkeit, Uhrzeit) — keine energiebasierten Vorschläge.

## Konsequenzen

- Shared-Modul `morning/` (oder ähnlich) mit Algo + Vitest inkl. Negativfälle (kein Check-in, beide niedrig, nur einer niedrig).
- UI zeigt Vorschlags-Karten mit Bestätigen/Ablehnen; Ablehnen ändert nichts.
- Keine neue Firestore-Collection für Vorschläge.
- `energyHint` auf Todos/Events wird für den Algo relevant (optional am Item, Default-Heuristik wenn fehlend).
- Pro-KI (Phase 4) kann dieselbe Fläche nutzen, ersetzt aber nicht die Free-Logik.

## Alternativen

- **Nur Sortierung (1A):** weniger UX-Nutzen, schwächerer Unterschied zu statischem Dashboard.
- **Automatisches Verschieben:** widerspricht „erklärbar“ und Nutzerkontrolle (ADR 0005).
- **Vorschläge in Firestore:** unnötige Komplexität; Bestätigung ist immer ein Item-Update.
