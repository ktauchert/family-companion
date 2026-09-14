# ADR 0010: Haushalts-ID von Firestore, Join per PIN und E-Mail-Whitelist

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Der Join-Link `/join/{inviteCode}` ist ein Website-Pfad. Auf Android soll Sophie in der App bleiben, nicht in der Web-App anmelden. Expo Go und fehlende Produktdomain machen Deep Links unzuverlässig. WLAN-URLs scheitern zusätzlich an Firebase `unauthorized-domain`.

Client-UUIDs als Dokument-ID waren unnötig: Firestore vergibt die ID. `crypto.randomUUID()` fehlt in Hermes.

Ein 6-stelliger PIN allein ist ratbar und kann bei einer vertippten Ziffer theoretisch einen anderen Haushalt treffen.

## Entscheidung

- **Dokument-ID** vergibt Firestore (`doc(collection).id`). Keine Client-UUID, kein SHA über die Doc-ID.
- **Ein PIN pro Haushalt**, 6 Ziffern, zufällig erzeugt und gespeichert (`invitePin`). Nicht aus der ID abgeleitet.
- **Whitelist** (`invitedEmails`): nur der Hauptuser (`ownerId`, wer den Haushalt angelegt hat) trägt E-Mails ein. Im UI stehen E-Mail und PIN nebeneinander.
- **Join:** Sophie gibt den PIN in der App (oder im Web-Onboarding) ein. Abgleich: PIN **und** Konto-E-Mail ∈ Whitelist (kleingeschrieben, getrimmt). Sonst kein Schreiben.
- Kein `/join/…`, kein Invite-URL-Helper, kein QR über eine Website. PIN geht per WhatsApp/SMS.
- Free: max. 2 Mitglieder; eine neue Einladung ersetzt die offene Adresse.

## Konsequenzen

- Derselbe Weg auf Web und Android, ohne Domain und ohne Push.
- Tippfehler in der E-Mail: Julian ändert den Listeneintrag. Sophie muss sich mit genau dieser Adresse anmelden (Google-Adresse kann abweichen).
- Nach dem Join bleibt die Konto-E-Mail am Mitglied (`memberEmails`) und ist auf der Haushaltsseite sichtbar. Einladungen haben CRUD; **Mitglieder brauchen mindestens R (E-Mail) und D (entfernen / austreten)** — sonst hängt der Haushalt nach einem Fehlbeitritt fest.
- Rules: Lesen nur Mitglieder oder eingeladene E-Mail; Join-Write nur wenn die Token-E-Mail auf der Liste steht. Member-Delete analog in Rules. Rules in der Console neu veröffentlichen. Alte Dokumente mit `inviteCode` sind ein anderes Schema — Haushalt neu anlegen.
- Universal Links bleiben eine spätere Option, nicht der Phase-1-Weg.

## Alternativen

- **Nur PIN:** alltagstauglich, aber ratbar und vertippbar in den falschen Haushalt.
- **SHA(Doc-ID + Secret):** Secret läge im Client; bei lesbaren Doc-IDs deterministisch.
- **Web-Link / Deep Link als Hauptweg:** bequem mit Domain und Store-Build, jetzt nicht tragfähig.
- **E-Mail + Push + PIN:** mehr Infrastruktur, Huhn-Ei ohne installierte App.
