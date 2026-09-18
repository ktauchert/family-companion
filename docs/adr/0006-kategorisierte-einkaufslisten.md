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

Pro Thema eine Liste: Einträge erstellen, in Echtzeit abhaken. **Phase 2.3:** haushaltsspezifische Listen (`shopping_lists`), nicht nur festes Enum — Default-Themen werden migriert.

**Smart Shopping in zwei Stufen:**

1. **Algo (Free),** sobald genug Ereignisse da sind: Vorschläge aus Häufigkeit und Abstand (z. B. Milch oft alle fünf Tage, zuletzt abgehakt vor sechs Tagen).
2. **KI (Pro):** Freitext (*Wir kochen Lasagne.*), plus reichere Vorschläge aus denselben Daten.

Analyse betrachtet Einfügen und Abhaken, getrennt nach Liste/Thema.

## Konsequenzen

- Phase 2: `ShoppingItem.category` als festes Enum.
- **Phase 2.3 (umgesetzt):** `ShoppingItem.listId` verweist auf `shopping_lists` pro Haushalt; Default-Themen (`Supermarkt`, …) werden beim ersten Öffnen als Listen angelegt und legacy `category`-Felder migriert.
- **Heute (#14):** Einkauf im Tagesplan aggregiert nach **Listenname** (`shoppingListId`), Tap-through zu `/listen?list=…`.
- Events (add/check) müssen für den Algo historisch auswertbar sein — nicht nur der aktuelle `checked`-Stand.
- Die alte Idee „nur KI-Zutaten aus Freitext“ bleibt Pro, ist aber nicht mehr der einzige Smart-Shopping-Weg.

## Alternativen

- **Eine Liste plus Tag-Filter:** einfacher, aber schlechter im Laden (kein klarer „Apotheke“-Kontext).
- **Nur KI-Vorschläge:** ohne Datenhistorie keine guten Defaults im Free Tier.

## UI & Custom Listen (Phase 2.3, 2026-09-15)

- Listen-Chips ohne „Alle“-Tab; Inline-Add mit Autocomplete (Teilmatch ab 3 Zeichen, Shared: `suggestShoppingItemNames`).
- Custom Listen (`shopping_lists`): Plus-Modal, Bearbeiten/Löschen am aktiven Tab; Inhaber darf Listen löschen; bei vorhandenen Items **Verschieben** in andere Liste.
- Details: [02.3-listen-ux.md](../phasen/02.3-listen-ux.md).
