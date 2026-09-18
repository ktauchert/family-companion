# ADR 0013: KI-Priorisierung und Tagesbriefing (Pro)

- Status: Accepted
- Datum: 2026-09-18
- Ergänzt: [ADR 0011](./0011-morgen-priorisierung-vorschlaege.md), [ADR 0012](./0012-tages-energie-budget.md)
- Umsetzung: [04-pro-ki-habits.md](../phasen/04-pro-ki-habits.md) WP2, WP4 (Shopping-KI)

## Kontext

Phase 2 liefert deterministische **Morgen-Priorisierung** mit Sortierung und bestätigten Vorschlägen ([ADR 0011](./0011-morgen-priorisierung-vorschlaege.md)). Pro soll ein **KI-Tagesbriefing** und feinere Umverteilung ergänzen, ohne Nutzerkontrolle zu verlieren.

OpenAI läuft **nur serverseitig** (Next.js Route Handler). Mobile und Web rufen dieselbe API auf.

## Entscheidung

### Rolle der KI

- KI **ersetzt** den Free-Algo nicht vollständig.
- KI **ergänzt**: synthetisches Briefing plus **verfeinerte** Sortierung/Vorschläge auf Basis derselben Tagesdaten und des Energie-Budgets ([ADR 0012](./0012-tages-energie-budget.md)).
- Free-Algo bleibt verfügbar und fallback-fähig (kein Check-in, API-Fehler, Free-Plan).

### Vorschläge

- Gleiches Modell wie Free: `PrioritizationSuggestion` mit Typen `postpone` / `reassign` (erweiterbar).
- **Bestätigung Pflicht** — gleiche UI und `applySuggestion*` wie Phase 2.
- Structured Output referenziert Items über **IDs**, nicht Titel-Strings.

### API

| Route | Zweck | Plan |
| --- | --- | --- |
| `/api/ai/daily-summary` | Briefing + Priorisierungsvorschläge | `pro` |
| Shopping-KI (WP4) | Freitext → Liste + Items | `pro` |

**Consent:** Vor jedem KI-Call bestätigt der Nutzer die Anfrage (Web + Mobile). Kein Hintergrund-LLM ohne Opt-in pro Abruf.

**Input (daily-summary):** Check-ins, Kalender, Todos, Listen, offene Pflicht-Habits, IST/Forecast Energie-Budget.

**Output:** `summary: string` + `suggestions: PrioritizationSuggestion[]` (Schema in Shared, Zod für Structured Output).

### Smart Shopping (WP4, Kurz)

- KI schlägt **Ziel-Liste und Items** vor — kein Default „Supermarkt“ allein.
- Freitext-Eingabe auf **Heute** und **Listen**.
- Free-Muster-Algo ([ADR 0006](./0006-kategorisierte-einkaufslisten.md) Stufe 1) bleibt separater, nicht-LLM-Pfad.

## Konsequenzen

- `AiSummaryResponseSchema` wird auf Item-IDs und Vorschlagstypen umgestellt (Breaking gegenüber Phase-0-Platzhalter — noch nicht produktiv genutzt).
- Pro-Gate in Route Handler und UI; kein OpenAI-Key im Client.
- Tests: Route mit Mock-LLM; Shared-Mapping Output → `PrioritizationSuggestion[]`.

## Alternativen

- **KI ersetzt Free-Algo komplett:** schlechtere Erklärbarkeit und Fallback — verworfen.
- **Separates KI-Vorschlags-UI:** doppelte Logik — verworfen (gleiches Bestätigungsmodell).
- **Titel-Matching statt IDs:** fehleranfällig bei gleichen Titeln — verworfen.
