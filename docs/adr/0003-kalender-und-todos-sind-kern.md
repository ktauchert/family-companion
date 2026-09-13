# ADR 0003: Kalender und Todos sind Kern

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Die erste Journey nannte „Listen & Termine“, das Datenmodell hatte nur Todos. Der Phasenplan ließ den Kalender offen. Für einen einfachen Haushalt sind Termine und Aufgaben neben der Einkaufsliste die zweite und dritte Säule. Ohne Kalender kann weder das Morgen-Dashboard noch ein Briefing sinnvoll priorisieren.

## Entscheidung

**Kalender und Todos sind Pflicht-Features im Free Tier.**

- Eigenes Kalender-Modell in Firestore (Events mit Beginn, optional Ende, Wiederholung, Zuweisung).
- Todos mit Titel, Status, optionaler Fälligkeit und Zuweisung.
- Import aus Google/Outlook ist *nicht* Teil dieser Entscheidung. Kommt später, eigenes ADR.

## Konsequenzen

- Phase 2 umfasst Kalender, nicht nur Listen.
- Shared-Types und Collections für Events sind nötig.
- Das Morgen-Dashboard (ADR 0005) und Habits (ADR 0004) setzen auf diesem Modell auf.

## Alternativen

- **Nur Google-Kalender einbetten:** weniger Eigenbau, aber kein gemeinsames Haushaltsmodell und schlechte Basis für Priorisierung.
- **Kalender auf Pro schieben:** Free wäre nur eine Einkaufsliste — zu wenig, um den Alltag zu tragen.
