# ADR 0009: Google und E-Mail/Passwort, App-Google nur nativ

- Status: Accepted
- Datum: 2026-09-13
- Ersetzt: [ADR 0008](./0008-google-anmeldung-zwei-pfade.md)

## Kontext

ADR 0008 wollte in Expo Go Google über Web-OAuth (Browser + Web-Client-ID). Google lehnt `exp://…` und nackte WLAN-IPs als Redirect/Origin ab. Dummy-User haben wir verworfen: Storage, Rules und später Kalender-Import hängen an einer **stabilen** Firebase-UID, möglichst demselben Google-Konto.

Ein zweites Google-Konto zum Testen (Sophie) ist unbequem. E-Mail/Passwort öffnet Türen (kein Google-Konto nötig) und läuft im Firebase-JS-SDK — auch in Expo Go, ohne OAuth-Redirect.

Web-PoC für Haushalt steht vor dem App-Gerätetest mit Google. Was im Web gilt, wird parallel in der App gebaut; Google auf Android erst im Dev-Build.

## Entscheidung

Zwei gleichwertige Anmeldewege, **eine** Firebase-Identität pro Person.

| Oberfläche | Google | E-Mail/Passwort |
| --- | --- | --- |
| Next.js Web | `signInWithPopup` | Firebase E-Mail/Passwort (Register + Login) |
| Expo Go | **nicht** | ja (JS-SDK) |
| Dev-Build / Store | nativ (`@react-native-google-signin`, dynamischer Import) | ja (JS-SDK) |

- Kein Expo-Go-Web-OAuth, kein `auth.expo.io`, kein Dummy-UID.
- App-Google nur nativ. `googleSignInPath` bleibt für den nativen Zweig; der Web-OAuth-Zweig wird nicht mehr als Produktweg geführt.
- Dieselbe UID gilt für Firestore, später Storage und Google-Kalender-Import (Scope am Google-Konto, nicht am E-Mail-User — Import bleibt an Google gebunden).
- Join-Test ohne zweites Google: zweites E-Mail-Konto auf `localhost` (zwei Browser) oder in der App (Expo Go).

## Konsequenzen

- Sophie kann in Expo Go den Haushalt testen, sobald E-Mail/Passwort in der App liegt — ohne Dev-Build.
- Google auf dem Handy bleibt der Komfortweg und der Anker für späteren Kalender-Import.
- Firebase Console: Provider **E-Mail/Passwort** einschalten, zusätzlich Google.
- WLAN-Link `http://192.168.x.x:3000` bleibt für **Web** problematisch (`unauthorized-domain` + Google-Origin). E-Mail auf der **Webseite über die IP** heilt das nicht. App-SDK und `localhost` schon.

## Alternativen

- **Nur Google, Dev-Build sofort:** korrekt nativ, Join ohne zweites Google-Konto unbequem.
- **Stub in Expo Go:** schnell, kaputte Identität für Storage/Import.
- **Tunnel (ngrok/Cloudflare) für Web-Join auf dem Handy:** geht, ist Ops, nicht die Produkt-Auth.
