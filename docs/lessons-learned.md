# Lessons Learned

Was uns umgeworfen hat, und was wir das nächste Mal zuerst prüfen. Neueste Einträge oben. Phase, in der es weh tat, in Klammern.

## Persistenz und CRUD (Phase 1)

- **Jede gespeicherte Entity braucht eine CRUD-Einschätzung, bevor der Store und die UI stehen.** Create allein macht den Datensatz tot: ohne lesbare Felder (R) sieht man nur Rollen-Platzhalter, ohne Delete (D) hängt ein falsches oder altes Mitglied für immer im Haushalt. Update (U) nur dort, wo sich Felder wirklich ändern sollen — weglassen ist ok, aber begründet.
- **Invites haben es gezeigt, Members hätten es von Anfang an im Phasenkonzept gebraucht.** Einladungen bekamen CRUD erst nachträglich (`/haushalt/einladen`). Mitglieder landeten als `members[]` plus optional `memberEmails`, die Oberfläche zeigte aber nur „Mitglied · Inhaber“ — die Konto-E-Mail fehlte, Entfernen fehlte. Join ohne Reverse-Pfad ist unflexibel (Trennung, Testkonten, falsche Person).
- **R heißt menschenlesbar, nicht nur IDs.** Eine Mitgliederliste ohne E-Mail (oder Namen) ist für den Alltag unbrauchbar. Fallback „Mitglied“ nur, wenn wirklich keine Adresse da ist — und dann als Datenlücke, nicht als Design.
- **C nicht doppelt bauen.** Mitglied anlegen bleibt Invite + Join. Ein zweites „Mitglied hinzufügen“-Formular wäre der falsche Create-Pfad. Dafür D: Owner entfernt, Mitglied tritt aus; Owner selbst nicht kicken ohne Auflösung/Transfer.
- **Rollen Alltag:** Inhaber vs Mitglied — kooperatives CRU, Löschen fremder Items nur Inhaber; Check-in privat. [phase-2-crud-roles.md](./design/phase-2-crud-roles.md)
- Nächstes Mal: vor dem ersten `setDoc` die vier Buchstaben an den Maintainer (und ins Phasen-WP). Regel in [AGENTS.md](../AGENTS.md).

## Auth und Geräte (Phase 1 / 1.1)

- **Natives Google (Expo Android):** Checkliste, EAS-Schritte und Support-Codes **GGL-xxx** → [native-google-expo-android.md](./lessons-learned/native-google-expo-android.md)
- **Expo Build-Fingerprint ≠ Keystore-SHA-1.** Auf der EAS-Build-Seite steht ein Projekt-Fingerprint (Hash der Quellen). Für Firebase/Google braucht es den **SHA-1 des Android-Keystores** unter Expo → Credentials → Android. Falschen Wert eintragen → `DEVELOPER_ERROR` (GGL-001), obwohl `google-services.json` größer wird und alles „richtig“ aussieht.
- **Hermes kennt kein `crypto`.** `crypto.randomUUID()` wirft in Expo Go / Android `Property 'crypto' doesn't exist`. Haushalts-ID vergibt Firestore. PIN über Shared `newInvitePin` (Web Crypto wenn da, sonst Fallback) — nie das nackte globale `crypto`.
- **Expo Go kann kein Google.** Weder natives Sign-In (Modul fehlt) noch Web-OAuth (`exp://…` verstößt gegen Googles OAuth-2.0-Regeln; `auth.expo.io` ist tot). App-Google = Dev-Build. Nicht noch einmal einen Browser-Pfad in Expo Go bauen.
- **Dummy-Login nicht als Dauerlösung.** Storage, Rules und später Kalender-Import brauchen eine stabile UID / ein echtes Google-Konto. Fake-User erzeugen Waisen-Dateien und einen zweiten „Google verbinden“-Pfad.
- **E-Mail/Passwort ist der Test- und Expo-Go-Weg**, nicht MockAPI und nicht eine Next-Fake-Auth. Zweites Konto ohne zweites Google. ([ADR 0009](./adr/0009-auth-google-und-email.md))
- **Provider aus = `OPERATION_NOT_ALLOWED`.** Register ohne eingeschalteten E-Mail/Passwort-Provider in der Console wirft `auth/operation-not-allowed`. Das darf nicht als generische „Anmeldung fehlgeschlagen“ enden — und Auth-Fehler dürfen nicht mit einem späteren Firestore-Fehler in einem Catch landen.
- **Join-Query muss zur Rule passen.** `where('invitePin', '==', pin)` scheitert an `permission-denied`, weil Firestore nicht beweisen kann, dass jedes PIN-Dokument für diese Person lesbar ist. Suche über `invitedEmails array-contains` (das die Read-Rule ausdrückt), PIN danach im Client.

## Env und Next/Turbopack (Phase 1)

- **Env liegt bei der App**, nicht im Repo-Root. Next lädt `apps/web/.env.local`, Expo `apps/mobile/.env.local`. Ein Root-File plus Parser kämpft mit Next-Caches (`loadEnvConfig` merkt sich den ersten leeren Load).
- **Keine Anführungszeichen** in `.env.local`: `KEY=wert`. Turbopack im Client strippt Quotes oft nicht; der Server schon — dann „Missing NEXT_PUBLIC_…“ trotz gefüllter Datei.
- **`process.env.NEXT_PUBLIC_FOO` statisch schreiben**, nie `process.env[name]`. Turbopack inlinet nur feste Namen. Dynamischer Zugriff ist im Browser `undefined`, auf dem Server nicht.
- **Next nach Env-Änderungen hart neu starten.** `NEXT_PUBLIC_*` sitzt im Client-Bundle. Ein alter `next dev` (oder zwei parallele) behält `undefined`. Exit 143 nach Kill ist dann Absicht.

## Firebase und Regeln (Phase 1)

- **Regeln im Repo gelten erst nach Veröffentlichen** in der Console (Firestore → Regeln). Sonst Default-Deny oder der 30-Tage-Testmodus.
- Client-Limits (`joinHousehold`, Free max. 2) sind kein Ersatz für Rules. Join-Suche läuft über die Whitelist, nicht über den PIN (Query muss zur Read-Rule passen).
- **Storage kommt später an dieselbe UID.** Auth-Entscheidung nicht nur am Login-Button festmachen.

## Prozess

- Docs und Haken nicht auf Grün setzen, solange der Weg in der Realität blockiert ist (Expo-Go-Google war abgehakt, ging aber nicht).
- Web und App parallel dieselben Shared-Regeln; Gerätetest der App-Google darf hinter dem Web-PoC liegen.
