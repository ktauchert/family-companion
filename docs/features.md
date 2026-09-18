# Features

Produktkatalog. Journey und Szenarien: [user-journey.md](./user-journey.md). Bau-Reihenfolge: [phasenplan.md](./phasenplan.md).

Kalender und Todos sind Kern ([ADR 0003](./adr/0003-kalender-und-todos-sind-kern.md)).

---

## Kern (Free)

| Feature | Nutzen | Notes |
| --- | --- | --- |
| Anmeldung | Google (Komfort) oder E-Mail/Passwort (auch ohne Google-Konto) | Web: `/login` vs `/register`; öffentliche Landing `/` (Phase 2.5). App: E-Mail überall; Google nur Dev-Build/Store, nicht Expo Go. Dieselbe Firebase-UID ([ADR 0009](./adr/0009-auth-google-und-email.md)) |
| Haushalt + Einladung | Gemeinsamer Kontext | Free: max. 2. Mitgliederliste mit Konto-E-Mail; **Inhaber** kann Mitglied entfernen, Mitglied kann austreten. Owner setzt E-Mail auf die Liste, PIN per Messenger. Kein Join-Link ([ADR 0010](./adr/0010-invite-pin-und-email-whitelist.md)) |
| **Rollen Alltag (Phase 2)** | Inhaber vs Mitglied | Kooperatives Anlegen/Bearbeiten für alle; **Löschen** fremder Kalender/Todos/Listeneinträge nur Inhaber. Details: [phase-2-crud-roles.md](./design/phase-2-crud-roles.md) |
| Echtzeit-Sync | Beide sehen denselben Stand | Firestore |
| **Kalender** | Termine, Wiederholungen | Web + App; KW-Ansicht, EventCards, View-/Edit-Modal, Plus-FAB; Habits sichtbar für Haushalt; Abhaken nur im Modal |
| **Todos** | Wer macht was | Web + App; TodoCards, View-/Edit-Modal, Plus-FAB; Checkbox auf Card + Modal; Fälligkeit, Zuweisung, Wiederholung, Habits |
| **Einkaufslisten nach Thema** | Getrennt abhaken | Web + App; haushaltsspezifische Listen (`shopping_lists`), Inline-Add, Autocomplete ab 3 Zeichen; Heute aggregiert nach Listenname ([ADR 0006](./adr/0006-kategorisierte-einkaufslisten.md), [02.3-listen-ux.md](./phasen/02.3-listen-ux.md)) |
| **Morgen-Check-in** | Stimmung + Energie nach dem Schlaf | Einmal pro Tag (drei Stufen je Feld); nach Speichern **Check-in-Chip** auf Heute (Phase 2.1), kein zweites Formular |
| **Heute-Dashboard** | Priorisierter Tagesüberblick | Mini-Cards, Summary pro Bereich, Icons; [02.1-heute-ux.md](./phasen/02.1-heute-ux.md) |
| **Einstellungen & Shell** | Konto, Theme, Abmelden, Legal | Web `/einstellungen`, Mobile Zahnrad auf Heute; Impressum/Datenschutz; Web-Footer ([02.4](./phasen/02.4-haushalt-nav-shell.md)) |
| **Priorisierung (Algo)** | Passt den Tag an Energie an | Sortierung + Vorschläge mit Bestätigung ([ADR 0011](./adr/0011-morgen-priorisierung-vorschlaege.md)); nutzt **Morgen-Snapshot**, kein laufendes Budget ([ADR 0012](./adr/0012-tages-energie-budget.md)) |
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
| **Tages-Energie-Budget** | Rest-Energie im Tagesverlauf (Tasks/Termine verbrauchen/entlasten) | Phase 4 ([ADR 0012](./adr/0012-tages-energie-budget.md)); baut auf Morgen-Check-in + `energyHint` auf |
| **Smart Shopping (KI)** | Freitext + Muster aus Abhaken/Einfügen | Z. B. *Wir kochen Lasagne.* |

---

## Bewusst nicht im Scope

Chat, Galerie, Locator, Budget, Dokumente, Rezeptbox/Meal-Planner als eigenes Modul. Essen läuft über Listen + Smart Shopping.

---

## Offene Punkte (nicht blockierend)

- Kalender-Import (Google) — später, eigenes ADR
- Payment-Provider
- Domain / Branding
