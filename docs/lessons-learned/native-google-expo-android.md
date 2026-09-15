# Natives Google Sign-In mit Expo (Android)

Checkliste und Fehlercodes für Phase 1.1. Kurzüberblick in [lessons-learned.md](../lessons-learned.md). Phasen-Ablauf: [01.1-dev-build-google-native.md](../phasen/01.1-dev-build-google-native.md).

## Grundsatz

**Expo Go kann kein Google.** Natives `@react-native-google-signin` braucht einen **eigenen Build** (EAS oder `expo run:android`). E-Mail/Passwort bleibt der Expo-Go-Testweg.

## Checkliste (einmalig pro Firebase-Projekt / EAS-App)

### Firebase & Google Cloud

1. Android-App in Firebase: Paket **`com.familycompanion.app`**
2. **Google-Provider** unter Authentication → Sign-in method: an
3. **Web-Client-ID** (OAuth client_type **3**, endet auf `.apps.googleusercontent.com`) → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `apps/mobile/.env.local` — **nicht** die Android-Client-ID als `webClientId`
4. **`google-services.json`** aus Firebase → `apps/mobile/google-services.json` (gitignored)
5. **SHA-1-Fingerabdrücke** in Firebase → Projekt-Einstellungen → Android-App → Fingerabdruck hinzufügen:
   - **Debug** (lokal): `npm run firebase:sha1` → nur für `expo run:android`
   - **EAS-Keystore** (Cloud-Build): Expo → [Credentials → Android → Keystore](https://expo.dev) → SHA-1 — **nicht** den Build-/Projekt-Fingerprint von der Build-Detailseite
6. Nach jedem neuen SHA-1: **`google-services.json` neu laden** (Datei wird größer, mehr `oauth_client`-Einträge mit `certificate_hash`)

### Env & Secrets (EAS)

```bash
cd apps/mobile
npx eas login
npx eas init   # einmalig — projectId in app.config.ts
npx eas env:push --environment preview --path .env.local
npx eas env:push --environment development --path .env.local
npx eas env:create preview --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
npx eas env:create development --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
```

Werte in `.env.local` **ohne** Anführungszeichen. Nach Änderung an Env oder `google-services.json`: **neu bauen** (Env und JSON sitzen im Build).

### Build & Install

```bash
cd apps/mobile
npm run build:preview:android   # einmaliger Google-E2E, standalone APK
# oder
npm run build:dev:android       # Dev-Client + Metro (--dev-client)
```

Install: Link/QR auf [expo.dev](https://expo.dev) → Build-Seite.

### E2E-Test

1. App öffnen (nicht Expo Go)
2. Login → **Mit Google anmelden**
3. Gleiche **Firebase-UID** wie Web-Login mit demselben Google-Konto
4. Pfad wie E-Mail: Onboarding oder Heute/Haushalt

## Typische Fallen

| Falle | Symptom | Fix |
| --- | --- | --- |
| Build-Fingerprint statt Keystore-SHA-1 | `DEVELOPER_ERROR` (GGL-001) | Credentials → Keystore-SHA-1 in Firebase |
| Nur Debug-SHA-1 eingetragen | GGL-001 auf EAS-APK | EAS-SHA-1 zusätzlich |
| Android- statt Web-Client-ID | GGL-003, kein idToken | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` = Web-Client |
| `google-services.json` alt / nicht im Build | GGL-001 trotz SHA-1 | Secret + Env aktualisieren, neu bauen |
| Expo Go | Kein Google-Button / Hinweistext | Bewusst so — Dev-Build nutzen |

## Fehlercodes (Endnutzer → Admin)

Die App zeigt Endnutzern **keine technischen Details**, nur einen **Support-Code**. Admins schlagen hier nach.

| Code | Bedeutung (Admin) | Typische Maßnahme |
| --- | --- | --- |
| **GGL-001** | Android-Konfiguration / `DEVELOPER_ERROR` | Keystore-SHA-1 in Firebase; Paketname; Web-Client-ID; ggf. neue `google-services.json` + Rebuild |
| **GGL-002** | Web-Client-ID fehlt im Build | `eas env:push`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, Rebuild |
| **GGL-003** | Kein Google-idToken | Web-Client-ID prüfen (nicht Android-Client) |
| **GGL-004** | Play Services | Nutzer: Play Store / Gerät |
| **GGL-005** | Kein Firebase-User nach Google | Auth-Flow / Firebase Console |
| **GGL-006** | Firebase nach Google-Token | Firebase-Provider, `auth/*`-Code in Logs |
| **GGL-007** | Abgebrochen | Kein Admin — Nutzer hat Dialog geschlossen |
| **GGL-008** | Netzwerk | Nutzer: Verbindung prüfen |
| **GGL-099** | Unbekannt | App-Log / `googleNativeAuthLogLine` in Metro |

Implementierung: [`packages/shared/src/auth/google-native-error.ts`](../../packages/shared/src/auth/google-native-error.ts)

## Code-Referenz

| Was | Wo |
| --- | --- |
| Pfad Expo Go vs nativ | `googleSignInPath` in shared |
| Native Sign-In | `apps/mobile/lib/auth/native-google.ts` |
| Fehlercodes | `packages/shared/src/auth/google-native-error.ts` |
| EAS-Config | `apps/mobile/eas.json`, `apps/mobile/app.config.ts` |
