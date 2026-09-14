# ADR 0008: Google-Anmeldung über zwei Pfade

- Status: Superseded
- Datum: 2026-09-13
- Ersetzt durch: [ADR 0009](./0009-auth-google-und-email.md)

## Kontext

Julian und Sophie sollen sich mit **demselben Google-/Firebase-Account** anmelden — im Web und in der Android-App. In **Expo Go** läuft kein natives Google Sign-In (`@react-native-google-signin/google-signin`, Play Services, SHA-1). Ein Dummy-Login in Expo Go wäre schneller, würde aber eine zweite Identität erzeugen und den Join-Flow gegen Firestore verfälschen.

## Entscheidung

Eine Identität, zwei Adapter. Die Wahl hängt an **Expo Go**, nicht an `__DEV__`.

| Laufzeit | Pfad | Wie |
| --- | --- | --- |
| Next.js Web | Google Popup | `signInWithPopup` + Web-Client |
| Expo Go (`appOwnership === 'expo'`) | Web-OAuth | Browser / Auth Session, **Web-Client-ID**, Token an `signInWithCredential` |
| Dev-Build / Store | Nativ | Play Services, dynamischer Import des Native-Pakets, dasselbe `signInWithCredential` |

Die Shared-Funktion `googleSignInPath({ isExpoGo })` gibt nur `'web-oauth' | 'native'` zurück. Das native Google-Paket wird **nicht statisch importiert** — in Expo Go knallt schon der Import.

Beide App-Pfade brauchen `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (nativ als `webClientId` für das Firebase-ID-Token). SHA-1 und `google-services.json` gelten erst für den Dev-/Store-Build.

## Konsequenzen

- Expo Go kann Auth und Haushalt **echt** gegen Firebase testen, ohne Dummy.
- Das Anmeldegefühl in Expo Go ist ein Browser-Fenster, nicht der System-Account-Picker.
- Google Cloud braucht Redirect-URIs für Expo (`https://auth.expo.io/@…/family-companion`) zusätzlich zu localhost fürs Web.
- Ein späterer Dev-Build schaltet automatisch auf nativ um.

## Alternativen

- **Dummy in Expo Go:** schnell, aber eigene Test-Identität; Join und Limits wären nicht dieselben User.
- **Nur Dev-Build:** korrekt nativ, aber Expo Go tot — langsamer Alltag.
- **Gate über `__DEV__`:** trifft auch den lokalen Dev-Build, der natives Google kann und soll.
