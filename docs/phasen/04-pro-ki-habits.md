# Phase 4 — Pro: KI, Habits, Smart Shopping

- Status: **offen**
- Branch: `phase-4-pro-ki-habits`
- Ergebnis: KI-Tag, Per-Member-Habits, Kaizen-Nudge, Smart Shopping
- ADRs: [0004](../adr/0004-per-member-habits-und-kaizen.md), [0012](../adr/0012-tages-energie-budget.md) *(Proposed)*

## Arbeitspakete

### WP1 — Per-Member und Habits

- [ ] Per-Member-Erledigung an Events/Todos
- [ ] Tägliche Pflicht-Habits, prominent am Start
- [ ] Kaizen-/Ikigai-Nudge bei verpasstem Tag (abschaltbar)

### WP2 — KI-Priorisierung

- [ ] `/api/ai/daily-summary` (Check-ins, Kalender, Todos, Listen)
- [ ] Verschieben / dem anderen zuweisen als bestätigter Vorschlag

### WP3 — Tages-Energie-Budget *(ADR 0012)*

Phase 2 speichert den Morgen-Check-in als **Snapshot**; `energyHint` an Items ist statisch. Hier: **Rest-Energie im Tagesverlauf** aus Check-in plus erledigten/offenen Aufgaben — Neusortierung auf Heute und Input für KI.

- [ ] CRUD-Einschätzung: nur berechnet vs. persistiertes `remainingEnergy` (oder ähnlich)
- [ ] Shared: Budget-Funktion (Start aus `morning_checkins`, Verbrauch aus `energyHint` + Completions/Termine)
- [ ] Tests inkl. Negativfälle (leerer Tag, nur leichte Tasks, Überbuchung)
- [ ] Heute-UI: optional Rest-Anzeige; Sortierung/Vorschläge nutzen Rest statt nur Morgenwert
- [ ] Abgrenzung Free-Algo ([ADR 0011](../adr/0011-morgen-priorisierung-vorschlaege.md)) vs. KI ([WP2](#wp2--ki-priorisierung))

### WP4 — Smart Shopping

- [ ] KI-Freitext (*Wir kochen Lasagne.*)
- [ ] Muster aus Listen (Algo bleibt auch Free nutzbar)
