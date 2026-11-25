# Kanjimo

**Kanjimo** (*Kanji* + *Moji* 文字, „Schriftzeichen“) ist eine Progressive Web App, mit der man Kanji
intuitiv und spielerisch lernt – zusammen mit **Mo**, einem kleinen Tintentropfen, der sich in
Pinselstriche verwandelt und die Strichfolge vormacht.

## Funktionen

- **Lernpfad** mit allen 2.212 Kanji von JLPT N5 bis N1: N5 in 21 thematischen Einheiten, N4–N1 in Einheiten zu je 6 Kanji (nach Häufigkeit)
- **Helles Design** (Washi-Papier, Mo in Sumi-Tusche) und **dunkles Design**, umschaltbar auf der Startseite oder in den Einstellungen
- **Lektionen**: Mo zeigt die Strichfolge → Nachspuren → aus dem Gedächtnis schreiben → gemischtes Quiz
- **Stricherkennung** in Echtzeit (Lage, Richtung, Reihenfolge) mit freundlichem Feedback und Tipps
- **Wiederholung mit FSRS** (Free Spaced Repetition Scheduler) – automatische Bewertung, gemischte Aufgabentypen
- **Spiele**: Blitzrunde, Paare finden, Tintenregen
- **Motivation**: Tagesziel, Serie mit Serienschutz, XP & Level, 25 Erfolge, Aktivitätskalender
- **Sammlung** mit Beherrschungsstufen, Detailansicht mit Bausteinen, Lesungen, Beispielwörtern und Vorlesefunktion
- Hell-/Dunkelmodus, Töne, Vibration, Export/Import, komplett **offline** nutzbar, keine Konten, kein Tracking

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Unit-Tests (Daten, Stricherkennung, Logik)
npm run build      # Typprüfung + Produktions-Build (dist/)
npm run preview    # Produktions-Build lokal testen
```

Hilfsskripte:

- `npm run fetch:strokes` – lädt die Strichdaten aus KanjiVG neu (`src/data/strokes.json`)
- `npm run fonts` – schneidet die Schriften auf die verwendeten Zeichen zu (`src/fonts/`)
- `npm run icons` – erzeugt die App-Icons aus der Mo-Grafik

Datenpipeline für N4–N1 (Quellen werden nach `scripts/.cache` geladen):

1. `node scripts/build-kanji-db.mjs` – Kanji, Lesungen, Strichdaten (`src/data/strokes/`) und Beispielwörter; schreibt Übersetzungs-Stapel nach `scripts/.work/batches/`
2. Deutsche Inhalte gemäß `scripts/TRANSLATION_BRIEF.md` als `out-*.json` erstellen
3. `node scripts/merge-kanji-db.mjs` – schreibt `src/data/levels/n1–n4.json`
4. `npm run fonts` – Schriften auf alle verwendeten Zeichen zuschneiden

Die kuratierten N5-Inhalte stehen in `src/data/kanji.ts` (`npm run fetch:strokes` für deren Strichdaten).

Der vollständige Entwicklungsplan steht in [PLAN.md](PLAN.md).

## Lizenzen

- Strichdaten: [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, CC BY-SA 3.0
- Lesungen & Beispielwörter: KANJIDIC2 und JMdict (EDRDG), CC BY-SA 4.0
- JLPT-Stufen: Listen von Jonathan Waller (tanos.co.uk), CC BY, via [kanji-data](https://github.com/davidluzgouveia/kanji-data)
- Schriften: M PLUS Rounded 1c, Klee One – SIL Open Font License 1.1
- FSRS-Planung: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (MIT)
