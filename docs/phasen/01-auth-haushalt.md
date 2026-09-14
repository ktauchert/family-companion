# Phase 1 — Auth & Haushalt (Free)

- Status: **in Arbeit**
- Branch: `phase-1-auth-haushalt`
- Ergebnis: Julian legt einen Haushalt an, Sophie tritt per PIN und E-Mail-Whitelist bei, Free-Limit gilt
- Journey: [user-journey.md](../user-journey.md) Phase 1
- UI: [design/ui.md](../design/ui.md)
- Auth: [ADR 0009](../adr/0009-auth-google-und-email.md) (ersetzt 0008)
- Invite: [ADR 0010](../adr/0010-invite-pin-und-email-whitelist.md)
- Lessons: [lessons-learned.md](../lessons-learned.md)

## Abgleich Plan → Ist

Was die Phase wollte, und wo wir nach den Umwegen stehen.

| Geplant | Ist |
| --- | --- |
| Google auf Web | **geprüft:** Popup, Haushalt anlegen |
| Google auf Android (Expo Go Web-OAuth, sonst nativ) | **verworfen für Expo Go** (Google blockiert `exp://`). Nativ vorbereitet (Paket, SHA-1, `google-services.json`), Gerätetest **nach** Web-PoC + Dev-Build |
| Dummy in Expo Go | **bewusst nicht** (Storage / UID / Kalender-Import) |
| Sophie joint per Link | **ersetzt** durch PIN + E-Mail-Whitelist (ADR 0010). `/join/…` entfernt. Join-E2E geprüft (PIN + Whitelist) |
| Mitglieder nur anlegen/listen | **WP4 erledigt:** Konto-E-Mail sichtbar; Owner entfernt, Mitglied tritt aus; E2E geprüft |
| Ein Root-`.env.local` | **korrigiert:** Env pro App (`apps/web`, `apps/mobile`) |
| QR-Code / Join-Link | **verworfen** als Hauptweg |
| PR nach `main` | offen — PR folgt |
| E-Mail/Passwort | **gebaut** (Web + App). Console: Provider *E-Mail/Passwort* einschalten |

## Arbeitspakete

### WP1 — Firebase Auth

- [x] Firebase-Projekt *(Console + `apps/web/.env.local` und `apps/mobile/.env.local`)*
- [x] Google Sign-In Web (`signInWithPopup`) — geprüft
- [x] Google Sign-In Android vorbereitet *(Paket `com.familycompanion.app`, `google-services.json`, SHA-1)*
- [x] Expo-Go-Web-OAuth entfernt; Google in der App nur nativ *(korrigiert)*
- [x] E-Mail/Passwort Web + App *(ergänzt, ADR 0009)* — `/login` vs `/register`; Fehlertexte je Flow; Console-Provider **E-Mail/Passwort** muss an sein (`auth/operation-not-allowed` sonst)
- [ ] Google nativ erst im Dev-Build testen *(nach Web-PoC)*

Env: `apps/web/.env.local` und `apps/mobile/.env.local`. Werte **ohne** Anführungszeichen. Kein Root-Parser.

### WP2 — Haushalt anlegen

- [x] Onboarding: Haushaltsname **oder** PIN-Join
- [x] Household-Dokument; **ID von Firestore** *(korrigiert)*
- [x] Shared `householdStore` (Firestore-Actions, ein `db` pro App) *(ergänzt)*
- [x] PIN ohne Web-`crypto` (`newInvitePin`) *(ergänzt, Hermes/Android)*
- [x] `firestore.rules` in der Console neu veröffentlichen *(Schema + PIN/Whitelist — ergänzt)*

### WP3 — Einladung und Join

- [x] Join-Link `/join/{code}` entfernt *(korrigiert, ADR 0010)*
- [x] Owner-Whitelist + Haushalts-PIN; CRUD unter `/haushalt/einladen` bzw. App `/einladen` *(ergänzt)*
- [x] Mitgliederliste auf der Haushaltsseite *(ergänzt)*
- [x] Shared `inviteToHousehold` + `joinHousehold` (PIN **und** E-Mail; Join-Suche über Whitelist, nicht über PIN-Query)
- [x] Join-E2E: Julian lädt E-Mail ein, Sophie tritt per PIN bei (Web oder App)
- [x] Free-Tier-Limit in Shared-Tests (positiv + negativ)
- [x] Shared-Regel `joinHousehold` *(ergänzt)*

### WP4 — Mitglieder: E-Mail sichtbar + CRUD *(ergänzt)*

CRUD-Einschätzung **Mitglied** (vor der Umsetzung, [AGENTS.md](../../AGENTS.md)):

| | Mitglied | Begründung |
| --- | --- | --- |
| **C** | nein (kein Extra-Pfad) | Anlegen bleibt Invite + Join. Kein zweites „Mitglied hinzufügen“. |
| **R** | ja, Pflicht | Liste mit **Konto-E-Mail**, Rolle, „du“. IDs/`Mitglied` allein reichen nicht. `memberEmails` muss beim Anlegen und Join geschrieben und angezeigt werden. |
| **U** | nein in Phase 1 | E-Mail ändert Auth, nicht den Haushalt. Owner-Transfer später. |
| **D** | ja, Pflicht | Owner entfernt ein Mitglied (Slot wird frei). Mitglied kann selbst austreten. Owner nicht kicken — Auflösung/Transfer später. |

Invite-CRUD bleibt unter `/haushalt/einladen` (C/R/U/D der Whitelist, schon gebaut). WP4 ist der **beigetretene** Account.

- [x] Mitgliederliste zeigt Konto-E-Mail (Web Haushalt, App Mehr); kein nacktes „Mitglied“ als einzige Zeile
- [x] Shared `removeHouseholdMember` / Austreten; Tests inkl. Negativ (nicht Owner, Owner nicht entfernen, fremdes Mitglied, Slot danach wieder frei)
- [x] UI: Owner **Entfernen**, selbst **Austreten**; danach Onboarding oder Login
- [x] `firestore.rules` für Member-Delete; nach Code in der Console neu veröffentlichen

## Definition of Done

- Web: Google **und** E-Mail/Passwort; Haushalt anlegen; Mitglieder **mit E-Mail**; Entfernen/Austreten; PIN + Whitelist unter Einladungen verwalten
- Join: zweites Mitglied per PIN und passender Konto-E-Mail; drittes Free-Mitglied abgelehnt; Mitglied wieder entfernbar
- App: dieselben Flows und Shared-Regeln; E-Mail/Passwort in Expo Go; Google nativ vorbereitet
- Tests für Start/Invite/Join/Remove inkl. Negativfälle (falscher PIN, fremde E-Mail, Owner nicht kicken)
- UI Art Paper / Stone, keine Sidebar
- Docs inkl. ADR 0009, ADR 0010 und Lessons Learned
- PR nach `main`

## Prüfung

- Shared: `npm run test`
- Rules in der Console aus `firestore.rules` veröffentlichen; alten Testhaushalt mit `inviteCode` löschen und neu anlegen — **erledigt**
- Web/App: Haushalt anlegen → E-Mail auf die Liste → PIN kopieren → zweites Konto mit **dieser** E-Mail → Onboarding → PIN — **Join-E2E geprüft**
- App: E-Mail/Passwort in Expo Go; Google erst im Dev-Build
- Negativ: falscher PIN, andere Konto-E-Mail, drittes Mitglied auf Free (Shared-Test genügt bis E2E)
- Mitglieder: E-Mails sichtbar; Owner entfernt Sophie → Slot frei; Sophie tritt aus → Onboarding — **E2E geprüft**
- Rules für Member-Delete in der Console neu veröffentlichen (Kick/Leave/E-Mail-Backfill) — **erledigt**
