# ADR 0005: Morgen-Check-in und energieabhängige Priorisierung

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Ein Dashboard, das alle Todos und Termine ungefiltert zeigt, überfordert. Morgens unterscheiden sich Stimmung und Energie. Ein Einkauf, der „heute“ geplant ist, ist falsch, wenn beide erschöpft sind — oder einer kann ihn übernehmen, wenn nur die andere Person flach ist.

## Entscheidung

Beim **App-Start am Morgen** gibt jede Person **Stimmung** und **Energie** nach dem Schlaf ein (einfache Skalen). Daraus wird die Tagesansicht sortiert und gefiltert.

- **Free:** deterministischer Algo. Regeln (Reihenfolge grob): Pflicht-Habits der Person → zeitgebundene Termine heute → Aufgaben, deren geschätzter Aufwand zum Energielevel passt → Rest nachrangig oder auf „verschieben“ vorgeschlagen.
- **Pro:** dieselbe Fläche, Priorisierung und Umverteilung per KI (Briefing, Vorschläge: verschieben, dem anderen zuweisen).

Beispiele:

- Beide niedrige Energie, Einkaufen geplant → Einkaufen nach hinten, leichtere oder wichtigere Low-Energy-Tasks nach vorn.
- Nur eine Person ist nicht fit → Vorschlag: verschieben *oder* die andere Person übernimmt.

Check-in ist pro User und Kalendertag. Ohne Check-in gilt eine neutrale Default-Priorisierung (Fälligkeit / Uhrzeit).

## Konsequenzen

- Neues Dokument `morning_checkins` (User, Datum, Mood, Energy).
- Todos/Events brauchen später optionale Aufwand-/Energie-Hinweise, sonst rät der Algo nur über Fälligkeit.
- Free bleibt erklärbar (keine Blackbox). Pro darf umsortieren, nicht still Daten löschen — Verschieben ist ein Vorschlag mit Bestätigung.

## Alternativen

- **Nur KI, kein Algo:** Free-Nutzer hätten kein sinnvolles Morgen-Dashboard.
- **Kein Check-in:** Priorisierung bleibt statisch, der beschriebene Nutzen entfällt.
- **Haushalts-weiter ein Check-in:** passt nicht, wenn die Energie der Personen auseinanderläuft.
