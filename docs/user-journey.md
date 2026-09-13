# User Journey

Neutrale Platzhalter-Namen: **Julian** und **Sophie**.

Produktkatalog: [features.md](./features.md).

## Personas

- **Julian (Power-User & Admin):** Richtet die App ein, kümmert sich um die Infrastruktur und sucht nach Automatisierung im Alltag.
- **Sophie (Pragmatische Alltags-Managerin):** Nutzt vor allem die Android-App unterwegs. Die App muss schnell sein, ohne Hürden funktionieren und sofortigen Mehrwert bieten (Sync in Echtzeit).

---

## Phase 1: Onboarding & Erst-Einrichtung (Standard / Free)

### 1. Registrierung & Haushalts-Erstellung (Julian – Next.js Web App)

1. **Landing Page:** Julian besucht die Web-App und klickt auf *Mit Google anmelden*.
2. **Auth Flow:** Über Firebase Google Auth ist der Account in 2 Klicks erstellt.
3. **Haushalt anlegen:** Ein Onboarding-Modal fragt nach dem Haushaltsnamen (*Unser Haushalt*).
4. **Einladungs-Link:** Die App generiert einen eindeutigen Einladungs-Link oder QR-Code (`https://family-app.com/join/hh_98765`).

### 2. Beitritt des zweiten Mitglieds (Sophie – React Native Android App)

1. **App-Start:** Sophie lädt die Android-App herunter und öffnet den Einladungs-Link von Julian.
2. **Google Sign-In:** Ein Klick auf *Mit Google fortfahren*.
3. **Auto-Join:** Das Firebase-Firestore-Backend schlägt die Brücke: Sophies `uid` wird im Firestore-Dokument `/households/hh_98765` zum `members`-Array hinzugefügt.
4. **Ergebnis:** Beide sind nun demselben Haushalt zugeordnet und im **Free Tier** (Max. 2 Personen).

---

## Phase 2: Der Alltag im Standard Tier (Free)

### Szenario A: Morgen-Check-in und Tagesplan

```text
 07:10  Julian öffnet die Web-App
   │
   ▼
 Stimmung + Energie nach dem Schlaf (Skalen)
   │
   ▼
 Algo sortiert den Tag:
   Pflicht / Uhrzeit zuerst
   dann Tasks, die zur Energie passen
   Einkaufen nach hinten, wenn Energie niedrig
```

1. Jede Person gibt morgens **Stimmung** und **Energie** ein.
2. Das Dashboard zeigt Kalender, Todos und anstehende Einkäufe, **priorisiert per Algo** (nicht KI).
3. Beispiel: Einkaufen steht auf heute, beide haben wenig Energie → Einkaufen wird nachrangig / Verschieben-Vorschlag, leichtere oder wichtigere Tasks rücken nach vorn.
4. Nur Sophie ist nicht fit → Vorschlag: verschieben **oder** Julian übernimmt.

### Szenario B: Einkaufen nach Thema

Sophie öffnet die Liste **Supermarkt** und hakte *Milch* und *Brot* ab. Julian sieht das in Echtzeit. Drogerie, Apotheke und Klamotten sind eigene Listen, nicht vermischt.

### Szenario C: Kalender und Todos

Beide legen Termine und Aufgaben für die Woche an. Ein Haushalts-Todo (*Auto saugen*) hakte eine Person ab — erledigt für alle.

Im Free Tier gibt es keine Mengenlimits bei Einkäufen, Todos oder Terminen.

---

## Phase 3: Der Trigger für das Pro-Upgrade

### Das Alltagsproblem

- Der Tag ist voll, aber unübersichtlich; der Algo reicht nicht mehr.
- Fitness soll *beide* tun — einer hakte ab, der andere nicht, das geht im Kopf verloren.
- Ein verpasster Habit-Tag verpufft ohne Impuls.
- Rezepte und Muster (Milch alle fünf Tage) werden nicht erkannt.

### Der In-App Conversion Moment

1. Ausgegraut: **KI-Tagesplan, Per-Member-Habits & Smart Shopping**.
2. Tooltip: Priorisierung per KI, getrennte Erledigung, Kaizen-Nudge, Vorschläge aus Listen und Freitext.
3. Julian setzt `plan: "pro"`. Kaizen-Nudges sind danach **abschaltbar**.

---

## Phase 4: Die Pro User Journey

### Szenario: Montag-Morgen (KI + Check-in)

```text
 07:00  Julian: Stimmung / Energie
      │
      ▼
 Next.js /api/ai/daily-summary
      ├── Check-ins beider Personen
      ├── Kalender + Todos + Listen
      └── Offene per-member Habits
      │
      ▼
 Dashboard:
 ├── Briefing
 ├── Fitness (Julian: offen, Sophie: schon erledigt)
 └── Einkaufen: Vorschlag „Julian übernimmt, Sophie Energie niedrig“
```

### Per-Member-Habit (Fitness)

1. Wiederkehrend, `mandatory` täglich, Erledigung `per_member`.
2. Beim Start sehen **beide** den Eintrag, bis sie selbst abgehakt haben.
3. Fehlt ein Tag: Hinweis plus kurzer **Kaizen-/Ikigai-Spruch** (Disziplin, 1 % heute). Abschaltbar.

### Smart Shopping

- Sophie: *Wir kochen am Mittwoch Lasagne.* → KI schlägt Zutaten für die **Supermarkt**-Liste vor.
- Parallel: Algo/KI liest Einfügen und Abhaken (pro Thema). Genug Daten → *Milch wieder auf die Liste?*

### Multi-Mitglieder

Weitere Personen per Einladungslink (Free war bei 2 Schluss).

---

## Feature-Matrix

| Feature | Standard (Free) | Pro |
| --- | --- | --- |
| Authentication | Google Sign-In | Google Sign-In |
| Haushalts-Limits | Max. 2 Mitglieder | Unbegrenzt |
| Echtzeit-Sync | Firestore | Firestore |
| Kalender | Eigenes Modell | Eigenes Modell |
| Todos | Haushalts-Erledigung, Zuweisung | + Per-Member, Habits |
| Einkaufslisten | Nach Thema (Supermarkt, Drogerie, …) | dieselben Listen |
| Morgen-Check-in | Stimmung + Energie | Stimmung + Energie |
| Tages-Priorisierung | Deterministischer Algo | + KI (umverteilen, verschieben) |
| Pflicht-Habits / Kaizen-Nudge | — | Ja, abschaltbar |
| Smart Shopping | Muster-Algo (wenn genug Daten) | + KI-Freitext und reichere Vorschläge |
| KI-Tagesbriefing | — | Ja |
