# Phase 2 — CRUD, Rollen und Persistenz

Einschätzung vor Store, Rules und UI ([AGENTS.md](../../AGENTS.md)). Gilt für Kalender, Todos, Listen und Morgen-Check-in. Architektur: [Shared + Firestore](../../AGENTS.md) — **keine** Next.js-API für Alltags-CRUD.

Quellen: [02-alltag.md](../phasen/02-alltag.md), Types in [`packages/shared/src/types`](../../packages/shared/src/types/index.ts), ADR [0003](../adr/0003-kalender-und-todos-sind-kern.md) · [0004](../adr/0004-per-member-habits-und-kaizen.md) · [0005](../adr/0005-morgen-check-in-und-priorisierung.md) · [0006](../adr/0006-kategorisierte-einkaufslisten.md).

---

## Rollenmodell

Zwei Rollen, **abgeleitet aus dem Haushalt** — keine separate Rollen-Collection in Phase 2.

| Rolle | Bedingung | Kurz |
| --- | --- | --- |
| **Inhaber (Owner)** | `auth.uid == household.ownerId` | Legt den Haushalt an; Phase-1-Rechte (Einladen, Mitglied entfernen, …) |
| **Mitglied (Member)** | `auth.uid in household.members` | Alltag gemeinsam nutzen; eingeschränktes **Löschen** fremder Inhalte |

Der Inhaber ist immer auch in `members[]`. „Mitglied“ meint hier **nicht-Inhaber** oder **jedes Haushaltsmitglied inkl. Inhaber**, je nach Spalte — in den Tabellen steht **Inhaber** vs **Mitglied (nicht Inhaber)**.

### Warum der Inhaber mehr darf

- Phase 1: Inhaber verwaltet **Menschen** (Einladung, Entfernen) — das bleibt.
- Phase 2: Alltag ist **kooperativ** (beide legen Termine/Todos/Listeneinträge an). Trotzdem braucht der Inhaber **Moderation**: falscher Eintrag, ausgeschiedenes Mitglied, Aufräumen ohne Streit über „wer darf löschen“.
- **Kein** Admin-Zugriff auf fremde **Morgen-Check-ins** (Stimmung/Energie bleiben privat pro Person).

### Was gleich bleibt (alle Mitglieder)

- Lesen aller Haushalts-Inhalte (Kalender, Todos, Listen, Check-ins der anderen für den **Algo** — siehe Check-in)
- Anlegen (Create)
- Bearbeiten (Titel, Zeit, Zuweisung, Abhaken) — kooperativer Haushalt à deux

### Was nur der Inhaber zusätzlich darf

- **Löschen** beliebiger Kalender-Events, Todos und Listenpunkte im Haushalt (nicht nur eigene)
- Haushalts-Metadaten (bereits Phase 1: Plan, Einladungen, `kaizenNudgesEnabled` später)

### Durchsetzung

| Schicht | Aufgabe |
| --- | --- |
| **`@family-companion/shared`** | Domain: Validierung, `canCreate` / `canUpdate` / `canDelete` mit `{ actorId, household, entity }` — testbar (Vitest) |
| **`firestore.rules`** | Muss dieselben Grenzen erzwingen (Client ist nicht vertrauenswürdig) |
| **UI** | Buttons ausblenden, wenn Shared-Regel nein sagt — kein Ersatz für Rules |

Neue Collections (Top-Level, `householdId`-Feld): `calendar_events`, `todos`, `shopping_items`, `morning_checkins` — siehe [`FIRESTORE_COLLECTIONS`](../../packages/shared/src/firebase/config.ts).

Rules-Muster (Konzept):

```javascript
function household(householdId) {
  return get(/databases/$(database)/documents/households/$(householdId)).data;
}
function isHouseholdMember(householdId) {
  return signedIn() && request.auth.uid in household(householdId).members;
}
function isHouseholdOwner(householdId) {
  return isHouseholdMember(householdId)
    && request.auth.uid == household(householdId).ownerId;
}
```

---

## Kalender-Event (`calendar_events`)

Collection laut Shared-Types. Felder u. a. `title`, `startsAt`, `endsAt`, `assignedTo` (`string[]`, leer = Haushalt), `completionMode`, `recurrence` (`none` \| `daily` \| `weekly`), `completions`, `kind`, `energyHint` (optional, Default `medium`).

**Ergänzung Phase 2:** `createdBy: string` (UID) — für Lösch-Rechte und Anzeige „angelegt von …“ (optional in UI).

| | Inhaber | Mitglied (nicht Inhaber) |
| --- | --- | --- |
| **C** Create | ja | ja |
| **R** Read | alle Events des Haushalts; menschenlesbar: Titel, Beginn/Ende, Wiederholung, Zuweisung (Name/E-Mail aus `memberEmails`), Erledigungsmodus, Status Abhaken | gleich |
| **U** Update | ja: Titel, Zeiten, Wiederholung, Zuweisung, `completionMode`, Abhaken (`household` / eigener `per_member`-Eintrag) | gleich |
| **D** Delete | jedes Event im Haushalt | nur Events mit `createdBy == actorId` |

**Create-Pfad:** Tab Kalender / Heute → Formular; kein zweiter Create-Pfad nötig.

**Delete begründet:** Mitglied darf eigene Fehleinträge entfernen; Inhaber räumt Streitfälle auf. Ohne Delete bleiben Events dauerhaft.

**Negativfälle (Tests):** nicht Mitglied → Create/Read/Update/Delete nein; Mitglied löscht fremdes Event → nein; Inhaber löscht fremdes → ja; `per_member`-Abhaken nur für `actorId` in `completions`.

---

## Todo (`todos`)

Analog Kalender: `title`, `status`, `dueDate`, `assignedTo` (`string[]`), `completionMode`, `recurrence`, `completions`, `kind`, `energyHint` (optional, Default `medium`).

**Ergänzung Phase 2:** `createdBy: string`.

| | Inhaber | Mitglied (nicht Inhaber) |
| --- | --- | --- |
| **C** | ja | ja |
| **R** | Titel, Fälligkeit, Status, Zuweisung, Modus, wer abgehakt hat | gleich |
| **U** | inkl. Abhaken / Wiedereröffnen | gleich |
| **D** | jedes Todo | nur `createdBy == actorId` |

**Negativfälle:** wie Events; Free-Limit betrifft nur Mitgliederzahl, nicht Todo-Anzahl.

---

## Listenpunkt (`shopping_items`)

Felder: `name`, `category` (Enum ADR 0006), `checked`, `addedBy`, `createdAt`, `checkedAt`. ADR 0006: Historie für Algo — **Delete** soft oder Event-Log später; Phase 2 mindestens **`checked` + Timestamps** behalten.

| | Inhaber | Mitglied (nicht Inhaber) |
| --- | --- | --- |
| **C** | ja (Thema/Liste wählen) | ja |
| **R** | Text, Thema, abgehakt ja/nein, wer hinzugefügt hat (E-Mail/Name) | gleich |
| **U** | Text/Thema ändern, abhaken (Echtzeit für alle) | gleich |
| **D** | jeder Punkt | nur `addedBy == actorId` |

**Delete begründet:** Tippfehler entfernen; Inhaber kann „Zombie“-Einträge löschen. Optional Phase 2.1: statt Hard-Delete nur `archived` — erst Hard-Delete laut WP.

**Negativfälle:** ungültige `category`; Abhaken durch Nicht-Mitglied; Delete fremder Zeile als Mitglied.

---

## Morgen-Check-in (`morning_checkins`)

Pro Nutzer und Kalendertag ([ADR 0005](../adr/0005-morgen-check-in-und-priorisierung.md)): `userId`, `date`, `mood`, `energy`, `householdId`.

| | Inhaber | Mitglied (nicht Inhaber) |
| --- | --- | --- |
| **C** | ein Check-in pro Tag **für sich** | gleich |
| **R** | **eigenen** voll; **fremde** im selben Haushalt: nur `mood`, `energy`, `date` (für Priorisierungs-Algo „beide niedrige Energie“) — **kein** Bearbeiten fremder | gleich |
| **U** | nur **eigener**, am **selben Kalendertag** (Korrektur morgens) | gleich |
| **D** | **nein** | **nein** |

**Delete begründet:** Tag soll für Auswertung/Algo nachvollziehbar bleiben; Korrektur über Update.

**Negativfälle:** zweiter Check-in am selben Tag → ablehnen; Update am Folgetag → nein; Lesen ohne Haushaltsmitgliedschaft → nein.

---

## Übersicht CRUD (Pflicht vs. Entscheidung)

| Entity | C | R | U | D | Rollen-Differenz |
| --- | --- | --- | --- | --- | --- |
| Kalender-Event | ja | ja | ja | ja | D: Inhaber alle, Mitglied nur eigene |
| Todo | ja | ja | ja | ja | D: wie Event |
| Listenpunkt | ja | ja | ja | ja | D: Inhaber alle, Mitglied nur `addedBy` |
| Morgen-Check-in | ja (self) | ja (self + Algo read other) | ja (self, same day) | nein | keine Admin-Override |

---

## UI / Menschen lesen (R)

IDs und UIDs allein reichen nicht ([lessons-learned.md](../lessons-learned.md)):

- **Zuweisung:** Anzeigename oder E-Mail aus `household.memberEmails`
- **Listen:** Thema als Label (Supermarkt, …), nicht nur Enum-String
- **Zeit:** lokales Format, nicht nur ISO in der UI
- **Erledigt:** „Erledigt“ / „Offen“ oder Häkchen + optional Zeit

---

## Nächste Schritte (Implementierung)

1. Shared: `createdBy` in Types; `can*` + Store pro Collection; Tests inkl. Rollen-Negativfälle
2. `firestore.rules` für vier Collections; in Console veröffentlichen
3. UI Web + App (Expo Go reicht für E-Mail-Alltag; kein API-Layer)
4. Phasen-Checklisten in [02-alltag.md](../phasen/02-alltag.md) abhaken

**Bewusst nicht in Phase 2:** separates Rollen-Enum in Firestore, Next.js-BFF für CRUD, Kalender-Import, KI-API (Phase 4).
