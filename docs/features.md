# Features

Produktkatalog. Journey und Szenarien: [user-journey.md](./user-journey.md). Bau-Reihenfolge: [phasenplan.md](./phasenplan.md).

Kalender und Todos sind Kern ([ADR 0003](./adr/0003-kalender-und-todos-sind-kern.md)).

---

## Kern (Free)

| Feature | Nutzen | Notes |
| --- | --- | --- |
| Google Sign-In | Schneller Einstieg | Web + Android |
| Haushalt + Einladung | Gemeinsamer Kontext | Free: max. 2 Mitglieder |
| Echtzeit-Sync | Beide sehen denselben Stand | Firestore |
| **Kalender** | Termine, Wiederholungen | Eigenes Modell; Import später |
| **Todos** | Wer macht was | Zuweisbar, Fälligkeit |
| **Einkaufslisten nach Thema** | Getrennt abhaken | Supermarkt, Drogerie, Apotheke, Klamotten, Sonstiges ([ADR 0006](./adr/0006-kategorisierte-einkaufslisten.md)) |
| **Morgen-Check-in** | Stimmung + Energie nach dem Schlaf | Pflicht für die Tagesansicht |
| **Priorisierung (Algo)** | Passt den Tag an Energie an | Z. B. Einkaufen verschieben, wenn beide flach sind ([ADR 0005](./adr/0005-morgen-check-in-und-priorisierung.md)) |
| Muster-Vorschläge Einkauf | „Milch ist oft nach 5 Tagen leer“ | Einfacher Algo, sobald genug Daten da sind |

---

## Pro (an- und abschaltbar, wo vermerkt)

| Feature | Nutzen | Notes |
| --- | --- | --- |
| Unbegrenzte Mitglieder | Weitere Personen einladen | Family+ |
| **Per-Member-Erledigung** | Jede Person hakte denselben Termin/Todo selbst ab | Z. B. Fitness für Julian *und* Sophie ([ADR 0004](./adr/0004-per-member-habits-und-kaizen.md)) |
| **Tägliche Pflicht-Habits** | Immer sichtbar, bis erledigt | Wiederkehrend, z. B. mandatory pro Tag |
| **Kaizen / Ikigai-Nudge** | 1 % heute, Disziplin halten | Hinweis + Motivationsspruch, wenn ein Tag fehlt. Abschaltbar. |
| **Priorisierung (KI)** | Feinere Reihenfolge und Umverteilung | Statt/zusätzlich zum Algo: wer übernimmt, was wartet |
| **KI-Tagesbriefing** | Morgenüberblick aus Kalender, Todos, Listen, Check-in | Erweitert den Free-Algo |
| **Smart Shopping (KI)** | Freitext + Muster aus Abhaken/Einfügen | Z. B. *Wir kochen Lasagne.* |

---

## Bewusst nicht im Scope

Chat, Galerie, Locator, Budget, Dokumente, Rezeptbox/Meal-Planner als eigenes Modul. Essen läuft über Listen + Smart Shopping.

---

## Offene Punkte (nicht blockierend)

- Kalender-Import (Google) — später, eigenes ADR
- Payment-Provider
- Domain / Branding
