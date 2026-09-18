# Phase 4 — Pro: KI, Habits, Smart Shopping

- Status: **offen**
- Branch: `phase-4-pro-ki-habits`
- Ergebnis: Pflicht-Habits, Kaizen-Nudge, Energie-Budget (IST + Forecast), KI-Briefing, Smart Shopping
- ADRs: [0004](../adr/0004-per-member-habits-und-kaizen.md), [0012](../adr/0012-tages-energie-budget.md), [0013](../adr/0013-ki-priorisierung-und-briefing.md)
- Milestone: [Phase 4 — Pro KI & Habits](https://github.com/ktauchert/family-companion/milestone/6)
- Issues: [#50 WP1](https://github.com/ktauchert/family-companion/issues/50) · [#51 WP3](https://github.com/ktauchert/family-companion/issues/51) · [#52 WP2](https://github.com/ktauchert/family-companion/issues/52) · [#53 WP4](https://github.com/ktauchert/family-companion/issues/53)
- PR-Reihenfolge: **WP1 → WP3 → WP2 → WP4** (jeweils eigener PR auf dem Phasen-Branch)

## Entscheidungen (Grill 2026-09-18)

| Thema | Entscheidung |
| --- | --- |
| Per-Member-Erledigung | Bereits **Free** (Phase 2) — kein Phase-4-WP |
| Pflicht-Habit | `mandatoryDaily` nur bei `plan === 'pro'` (Shared + Rules) |
| Pflicht-Habit + Erledigung | `mandatoryDaily` **darf** `household` oder `per_member` sein |
| Kaizen-Zeitpunkt | **Selber Abend**, wenn Pflicht-Habit für die Person noch offen |
| Kaizen abschalten | **Jedes Mitglied** für sich (`kaizenNudgesEnabled` pro User, nicht am Household) |
| Kaizen-Sprüche | Lokale Liste zuerst; LLM optional später |
| KI vs. Free-Algo | KI **ergänzt** Briefing und verfeinert Sortierung/Vorschläge; Free-Algo bleibt Basis ([ADR 0013](./0013-ki-priorisierung-und-briefing.md)) |
| KI-Vorschläge | Gleiches Modell wie Free: `PrioritizationSuggestion` + Bestätigung |
| KI-API | `/api/ai/daily-summary` — Web **und** Mobile; Nutzer bestätigt Anfrage vor dem Call |
| Energie-Budget | Nur **berechnet**; Skala **0–50** (10× Check-in 1/3/5); Neuberechnung beim Heute-Load, nicht live pro Checkbox |
| Energie-UI | **Free:** IST + Forecast auf Heute; **Pro:** feinere Sortierung/KI nutzen Budget |
| Smart Shopping | WP4: zuerst Free-Muster-Algo, dann KI-Freitext auf **Heute und Listen**; KI schlägt **Liste + Items** vor |

---

## Arbeitspakete

### WP1 — Pflicht-Habits und Kaizen *(PR 1)*

*Bereits in Phase 2:* `per_member`, `kind: habit`, Completions, Priorisierung offener Habits.

- [x] Shared + Rules: `mandatoryDaily` nur bei `plan === 'pro'`
- [x] UI (Web + Mobile): `mandatoryDaily` im Event-/Todo-Formular (nur Pro)
- [x] Heute: Pflicht-Habits **prominent**, bis eigene Erledigung (`per_member`) bzw. Haushalts-Erledigung (`household`)
- [x] Kaizen-Nudge am **Abend**, wenn Pflicht-Habit für die Person noch offen; lokale Sprüche (kein LLM in WP1)
- [x] Einstellungen: Toggle `kaizenNudgesEnabled` **pro Mitglied** (nicht haushaltsweit)

#### CRUD — `kaizenNudgesEnabled` (pro User)

| | Einschätzung |
| --- | --- |
| **C** | Default `true` beim ersten Zugriff / fehlendes Feld |
| **R** | Eigener Toggle in Einstellungen sichtbar |
| **U** | Nur **eigener** Wert durch das Mitglied |
| **D** | Kein Löschen; zurück auf Default |

*Speicherort:* `user_preferences/{uid}` — **`Household.kaizenNudgesEnabled` ablösen** (deprecated).

---

### WP3 — Tages-Energie-Budget *(PR 2, ADR 0012)*

Phase 2: Morgen-Snapshot 1/3/5, statisches `energyHint`. Hier: **Budget-Skala 0–50**, IST + Forecast auf Heute.

- [ ] Shared: `energyBudget` — Start aus Check-in (×10), Verbrauch aus `energyHint` + Tages-Items; **keine** Persistenz
- [ ] Mapping `energyHint` → Budget-Punkte kalibrieren und in Tests festhalten *(Vorschlag: low/medium/high — Werte in Implementierung mit Negativfällen)* 
- [ ] Neuberechnung beim **Heute-Load/Sync**, nicht optimistisch pro Abhaken-Klick
- [ ] Heute-UI (**Free**): **IST** (Rest-Energie) + **Forecast** (Summe aller heutigen Aufgaben/Termine) — „passt heute / Überbuchung“
- [ ] Priorisierung: Free-Algo kann Forecast/IST einbeziehen; volle Verfeinerung mit KI in WP2
- [ ] Tests: leerer Tag, nur leichte Tasks, Überbuchung (Forecast > Start), ohne Check-in

---

### WP2 — KI-Priorisierung *(PR 3, ADR 0013)*

- [ ] `/api/ai/daily-summary` (Check-ins, Kalender, Todos, Listen, Budget, offene Pflicht-Habits)
- [ ] Structured Output → `summary` + `PrioritizationSuggestion[]` mit **Item-IDs** (Schema erweitern)
- [ ] Consent-Dialog vor API-Call (Web + Mobile); nur bei `plan === 'pro'`
- [ ] Heute: Briefing-Karte + KI-Vorschläge mit gleicher Bestätigen/Ablehnen-UI wie Free
- [ ] `AiSummaryResponseSchema` auf IDs + Vorschlagstypen umstellen

---

### WP4 — Smart Shopping *(PR 4)*

- [ ] Free-Muster-Algo aus Listen-Historie ([ADR 0006](../adr/0006-kategorisierte-einkaufslisten.md) Stufe 1) — vor KI
- [ ] KI-Freitext (*Wir kochen Lasagne.*) auf **Heute** und **Listen**
- [ ] KI schlägt **Ziel-Liste + Items** vor; Nutzer bestätigt vor Anlegen
- [ ] `/api/ai/…` für Shopping (oder Teilroute) — Consent wie WP2
