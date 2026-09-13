# ADR 0006: Kategorisierte Einkaufslisten und datengetriebenes Smart Shopping

- Status: Accepted
- Datum: 2026-09-13

## Kontext

Eine einzige flache Liste vermischt Supermarkt, Drogerie, Apotheke und Klamotten. Im Laden braucht man die passende Liste. Aus Abhaken und Neueinträgen entstehen mit der Zeit Muster — das ist die Grundlage für Vorschläge, unabhängig von Freitext-KI.

## Entscheidung

Einkäufe hängen an einer **Liste mit Thema** (`ShoppingCategory`):

- `supermarket`
- `drugstore`
- `pharmacy`
- `clothing`
- `other`

Pro Thema eine Liste: Einträge erstellen, in Echtzeit abhaken. Weitere Themen später möglich, ohne das Modell zu ändern.

**Smart Shopping in zwei Stufen:**

1. **Algo (Free),** sobald genug Ereignisse da sind: Vorschläge aus Häufigkeit und Abstand (z. B. Milch oft alle fünf Tage, zuletzt abgehakt vor sechs Tagen).
2. **KI (Pro):** Freitext (*Wir kochen Lasagne.*), plus reichere Vorschläge aus denselben Daten.

Analyse betrachtet Einfügen und Abhaken, getrennt nach Liste/Thema.

## Konsequenzen

- `ShoppingItem.category` ist ein festes Enum, kein freier String.
- Events (add/check) müssen für den Algo historisch auswertbar sein — nicht nur der aktuelle `checked`-Stand.
- Die alte Idee „nur KI-Zutaten aus Freitext“ bleibt Pro, ist aber nicht mehr der einzige Smart-Shopping-Weg.

## Alternativen

- **Eine Liste plus Tag-Filter:** einfacher, aber schlechter im Laden (kein klarer „Apotheke“-Kontext).
- **Nur KI-Vorschläge:** ohne Datenhistorie keine guten Defaults im Free Tier.
