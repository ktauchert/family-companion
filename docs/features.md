# Features

Produktkatalog. Journey und Szenarien: [user-journey.md](./user-journey.md). Bau-Reihenfolge: [phasenplan.md](./phasenplan.md).

Kalender und Todos sind Kern ([ADR 0003](./adr/0003-kalender-und-todos-sind-kern.md)).

---

## Kern (Free)

| Feature | Nutzen | Notes |
| --- | --- | --- |
| Anmeldung | Google (Komfort) oder E-Mail/Passwort (auch ohne Google-Konto) | Web: `/login` vs `/register`; öffentliche Landing `/` ([02.5](./phasen/02.5-landing-scaffold.md)). App: E-Mail überall; Google nur Dev-Build/Store, nicht Expo Go. Dieselbe Firebase-UID ([ADR 0009](./adr/0009-auth-google-und-email.md)) |
| Haushalt + Einladung | Gemeinsamer Kontext | Free: max. 2. Mitgliederliste mit Konto-E-Mail; **Inhaber** kann Mitglied entfernen, Mitglied kann austreten. Owner setzt E-Mail auf die Liste, PIN per Messenger. Kein Join-Link ([ADR 0010](./adr/0010-invite-pin-und-email-whitelist.md)) |
| **Rollen Alltag (Phase 2)** | Inhaber vs Mitglied | Kooperatives Anlegen/Bearbeiten für alle; **Löschen** fremder Kalender/Todos/Listeneinträge nur Inhaber. Details: [phase-2-crud-roles.md](./design/phase-2-crud-roles.md) |
| Echtzeit-Sync | Beide sehen denselben Stand | Firestore |
| **Kalender** | Termine, Wiederholungen | Web + App; KW-Ansicht, EventCards, View-/Edit-Modal, Plus-FAB; Habits sichtbar für Haushalt; Abhaken nur im Modal |
| **Todos** | Wer macht was | Web + App; TodoCards, View-/Edit-Modal, Plus-FAB; Checkbox auf Card + Modal; Fälligkeit, Zuweisung, Wiederholung, Habits |
| **Einkaufslisten nach Thema** | Getrennt abhaken | Web + App; haushaltsspezifische Listen (`shopping_lists`), Inline-Add, Autocomplete ab 3 Zeichen; Heute aggregiert nach Listenname ([ADR 0006](./adr/0006-kategorisierte-einkaufslisten.md), [02.3-listen-ux.md](./phasen/02.3-listen-ux.md)) |
| **Morgen-Check-in** | Stimmung + Energie nach dem Schlaf | Einmal pro Tag (drei Stufen je Feld); nach Speichern **Check-in-Chip** auf Heute (Phase 2.1), kein zweites Formular |
| **Heute-Dashboard** | Priorisierter Tagesüberblick | Mini-Cards, Summary pro Bereich, Icons; [02.1-heute-ux.md](./phasen/02.1-heute-ux.md) |
| **Einstellungen & Shell** | Konto, Theme, Abmelden, Legal | Web `/einstellungen`, Mobile Zahnrad auf Heute; Impressum/Datenschutz im Marketing-Layout; App-Chrome nur in `(app)/…` ([02.4](./phasen/02.4-haushalt-nav-shell.md), [02.5](./phasen/02.5-landing-scaffold.md)) |
| **Priorisierung (Algo)** | Passt den Tag an Energie an | Sortierung + Vorschläge mit Bestätigung ([ADR 0011](./adr/0011-morgen-priorisierung-vorschlaege.md)); Morgen-Snapshot; ab Phase 4 **IST + Forecast** auf Heute ([ADR 0012](./adr/0012-tages-energie-budget.md)) |
| Muster-Vorschläge Einkauf | „Milch ist oft nach 5 Tagen leer“ | Einfacher Algo (Phase 4 WP4), sobald genug Daten da sind |
| **Energie-Budget (Anzeige)** | Sieht vorher, ob der Tag passt | IST + Forecast auf Heute — auch **Free** ([ADR 0012](./adr/0012-tages-energie-budget.md)) |

---

## Pro (an- und abschaltbar, wo vermerkt)

| Feature | Nutzen | Notes |
| --- | --- | --- |
| Unbegrenzte Mitglieder | Weitere Personen einladen | Family+ |
| **Per-Member-Erledigung** | Jede Person hakte denselben Termin/Todo selbst ab | **Free** — z. B. Fitness ([ADR 0004](./adr/0004-per-member-habits-und-kaizen.md)) |
| **Tägliche Pflicht-Habits** | Immer sichtbar auf Heute, bis erledigt | Nur Pro; `mandatoryDaily` |
| **Kaizen / Ikigai-Nudge** | 1 % heute, Disziplin halten | Abends bei offenem Pflicht-Habit; Spruch lokal (LLM optional später). **Jedes Mitglied** schaltet für sich ab. |
| **Priorisierung (KI)** | Feinere Reihenfolge und Umverteilung | Ergänzt Free-Algo; Consent vor API ([ADR 0013](./adr/0013-ki-priorisierung-und-briefing.md)) |
| **KI-Tagesbriefing** | Morgenüberblick aus Kalender, Todos, Listen, Check-in, Budget | `/api/ai/daily-summary`; Web + Mobile |
| **Tages-Energie-Budget (Verfeinerung)** | KI und Pro-Sortierung nutzen IST/Forecast | Anzeige IST + Forecast auch **Free** ([ADR 0012](./adr/0012-tages-energie-budget.md)) |
| **Smart Shopping (KI)** | Freitext auf Heute und Listen | KI schlägt **Liste + Items** vor; Free-Muster-Algo separat ([ADR 0006](./adr/0006-kategorisierte-einkaufslisten.md)) |

---

## Bewusst nicht im Scope

Chat, Galerie, Locator, Budget, Dokumente, Rezeptbox/Meal-Planner als eigenes Modul. Essen läuft über Listen + Smart Shopping.

---

## Offene Punkte (nicht blockierend)

- Landing-Design (Marketing): finales Visual, Screenshots, SEO — Scaffold [02.5](./phasen/02.5-landing-scaffold.md)
- Kalender-Import (Google) — später, eigenes ADR
- Payment-Provider
- Domain / Branding
