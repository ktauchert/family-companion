# ADR 0012: Tages-Energie-Budget — Morgen-Snapshot heute, dynamischer Verbrauch später

- Status: Proposed
- Datum: 2026-09-15
- Ergänzt: [ADR 0005](./0005-morgen-check-in-und-priorisierung.md), [ADR 0011](./0011-morgen-priorisierung-vorschlaege.md)
- Geplant: Phase 4 (siehe [04-pro-ki-habits.md](../phasen/04-pro-ki-habits.md))

## Kontext

Der Morgen-Check-in erfasst Stimmung und Energie **einmal pro Tag** ([ADR 0005](./0005-morgen-check-in-und-priorisierung.md)). Phase 2 speichert dafür Werte auf einer 1–5-Skala; die UI nutzt drei Stufen (z. B. Mies / Neutral / Spitze → 1 / 3 / 5).

Im Alltag ändert sich die verfügbare Energie jedoch: ein energieintensiver Termin oder ein abgehakter schwerer Task „kostet“ Kapazität; leichte Erledigungen oder Pausen können subjektiv eher entlasten. Das ist **nicht** dasselbe wie das statische Feld `energyHint` an einem Todo/Event — das beschreibt nur den **geschätzten Aufwand** des Items, nicht den **aktuellen Rest** der Person am Tag.

Phase 2 priorisiert anhand des **Morgen-Snapshots** plus `energyHint` der offenen Items ([ADR 0011](./0011-morgen-priorisierung-vorschlaege.md)). Ein laufendes Energie-Budget ist bewusst **nicht** Teil von Phase 2.

## Entscheidung

### Phase 2 (umgesetzt, Stand 2026-09-15)

| Thema | Verhalten |
| --- | --- |
| **Check-in UI** | Drei Buttons je Stimmung und Energie; Speichern legt den Tageswert an |
| **Nach erstem Speichern** | Check-in auf **Heute ausgeblendet** — kein Bearbeiten in der Tagesansicht |
| **Persistenz** | `morning_checkins`: `mood` und `energy` als Zahl (1 / 3 / 5 aus UI) |
| **Priorisierung** | Nutzt den **gespeicherten Morgenwert** den ganzen Tag; keine automatische Anpassung beim Abhaken |
| **`energyHint`** | Statisches Metadatum am Event/Todo (`low` \| `medium` \| `high`), Default `medium` |

Technisch erlauben Shared und Firestore noch **Update am selben Kalendertag** (Korrekturpfad aus [phase-2-crud-roles.md](../design/phase-2-crud-roles.md)); die Heute-UI nutzt ihn nicht. Ein späteres ADR-Update kann Updates ganz abschalten, wenn gewünscht.

### Später — Tages-Energie-Budget (Phase 4, Proposed)

Ein **berechneter Tagesverlauf** auf Basis des Morgen-Check-ins:

1. **Startwert** = gespeicherte Energie aus `morning_checkins` (und optional Stimmung als Gewicht).
2. **Verbrauch / Entlastung** = Funktion aus erledigten und offenen Items mit `energyHint`, optional Dauer/Zeitfenster (Termine).
3. **Rest-Energie** (virtuell oder persistiert) steuert **Neusortierung** auf Heute und ggf. neue Vorschläge — ergänzt den Free-Algo und die KI-Priorisierung ([Phase 4](../phasen/04-pro-ki-habits.md)).

**Noch nicht festgelegt** (vor Implementierung klären):

- Nur **berechnet** aus Check-in + Completions, oder zusätzliches Feld (z. B. `remainingEnergy`) pro User/Tag?
- Ob Abhaken **sofort** den Rest senkt oder nur beim Tages-Replay;
- Grenzen (nie unter 0, Deckel bei 5, Haushalts-Aggregation für Partner-Vorschläge).

## Konsequenzen

- Phase 2 bleibt erklärbar: ein Check-in, ein Algo-Snapshot, keine versteckte Energie-Arithmetik.
- Phase 4 braucht eigene Tests für Budget-Logik (Start, Verbrauch, Sortierung, Negativfälle).
- UI Phase 4: optional Anzeige „noch Energie für …“ auf Heute — nicht in Phase 2.
- KI-Briefing ([Phase 4](../phasen/04-pro-ki-habits.md)) kann Rest-Energie als Input nutzen, ersetzt aber nicht den deterministischen Free-Pfad.

## Alternativen

- **Nur Morgen-Snapshot (Status quo Phase 2):** einfach, aber Tagesverlauf unrealistisch nachmittags.
- **Nutzer passt Check-in mehrmals an:** widerspricht „morgens festgelegt“; verworfen für Heute-UX.
- **Sofort in Phase 2:** zu viel Scope neben CRUD und erstem Algo; verschoben auf Phase 4.
