# Auftrag: Deutsche Lerninhalte für Kanjimo (Kanji-Lern-App)

Du erstellst deutsche Lerninhalte für Kanji. Eingabedateien liegen in `scripts/.work/batches/in-NNN.json`
(JSON-Array). Für jede dir zugewiesene Eingabedatei `in-NNN.json` schreibst du **genau eine** Ausgabedatei
`scripts/.work/batches/out-NNN.json`. Ändere sonst keine Dateien.

## Eingabe (pro Kanji)
- `c` Kanji, `level` JLPT-Stufe, `en` englische Bedeutungen (KANJIDIC), `on`/`kun` Lesungen,
- `parts` Bausteine (mit englischer Bedeutung, falls bekannt),
- `ex` Beispielwörter: `w` Wort, `r` Lesung, `en` englische Bedeutung.

## Ausgabe
Ein JSON-Array in **derselben Reihenfolge** mit genau einem Objekt pro Eingabe-Kanji:

```json
[{"c":"会","m":["treffen","Versammlung","Gesellschaft"],"mn":"Ein Mensch (人) und jemand, der etwas sagt (云), kommen zusammen – sie treffen sich zur Versammlung.","ex":["sich treffen, begegnen","Versammlung, Treffen","Mitglied"]}]
```

### Regeln
1. `m`: 1–3 deutsche Bedeutungen, wichtigste zuerst, jeweils kurz (höchstens ~20 Zeichen).
   Substantive groß, Verben im Infinitiv klein („treffen“), Adjektive klein („gleich“).
   Keine Dopplungen, keine Erklärungen in Klammern, kein Englisch.
2. `mn`: Eine deutsche Eselsbrücke (Mnemonic), 1–2 Sätze, höchstens 170 Zeichen.
   Bildhaft, freundlich, leicht merkbar. Sie muss die Kernbedeutung (`m[0]`) klar enthalten oder
   unmissverständlich darauf hinführen. Wenn `parts` vorhanden sind, baue sie ein und schreibe das
   Zeichen in Klammern dahinter, z. B. „Ein Baum (木) …“. Erfinde keine Bausteine, die nicht in `parts`
   stehen (das Zeichen selbst darfst du als Ganzes beschreiben). Keine japanischen Lesungen in der Eselsbrücke.
3. `ex`: Array mit **genau so vielen** Einträgen wie `ex` in der Eingabe (auch `[]`, wenn leer).
   Jeder Eintrag ist die deutsche Bedeutung des jeweiligen Beispielworts, kurz (höchstens ~40 Zeichen),
   mehrere Bedeutungen mit Komma getrennt. Verben als „etwas tun“ im Infinitiv („sich treffen“).
4. Gültiges JSON (doppelte Anführungszeichen, keine Kommentare, keine abschließenden Kommas).
   In Texten deutsche Anführungszeichen „…“ verwenden, niemals unescapte `"`.
5. Sorgfalt vor Tempo: korrekte Übersetzungen, natürliches Deutsch, keine Platzhalter.

Schreibe jede Ausgabedatei mit dem Write-Werkzeug. Wenn eine Datei sehr lang wird, ist das in Ordnung –
schreibe sie trotzdem vollständig. Prüfe danach mit einem kurzen Node-Befehl, dass die Datei gültiges JSON
ist und genauso viele Einträge (mit identischen `c` in gleicher Reihenfolge) wie die Eingabe hat, z. B.:

```bash
node -e "const a=require('./scripts/.work/batches/in-000.json'),b=require('./scripts/.work/batches/out-000.json');if(a.length!==b.length||a.some((x,i)=>x.c!==b[i].c||x.ex.length!==b[i].ex.length))throw 'Fehler';console.log('ok')"
```

Melde am Ende nur kurz, welche Dateien du geschrieben hast und ob alle Prüfungen „ok“ ergaben.
