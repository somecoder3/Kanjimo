# Kanjimo – Entwicklungsplan

> **Kanjimo** = *Kanji* + *mo* aus *moji* (文字, „Schriftzeichen“).
> Maskottchen: **Mo**, ein lebendiger Tintentropfen, der sich in Pinselstriche
> aufteilt und so die Strichfolge vormacht. „Ich bin Mo. Zusammen schreiben wir dein erstes Kanji.“

Dieser Plan ist zugleich Checkliste. Jeder Punkt wird beim Umsetzen abgehakt und
am Ende im Browser (Smartphone-Viewport) überprüft.

---

## 1. Ziele

| Ziel | Messbar durch |
|---|---|
| Intuitiv | Erste Lektion ohne Erklärung startbar, 1 Tipp bis zum ersten Kanji |
| Motivierend | Tagesziel, Serie (Streak) mit Freeze, XP/Level, Erfolge, Mo reagiert emotional |
| Für jeden Lerntyp | visuell, auditiv, kinästhetisch (Schreiben), lesend, spielerisch |
| Wissenschaftlich fundiert | FSRS-Wiederholung, Active Recall, Generation Effect, Dual Coding, Interleaving |
| Fehlerfrei & poliert | Unit-Tests für Logik & Daten, manuelle Prüfung aller Flows, keine Konsolenfehler |
| Mobile first | 360–430 px optimiert, Daumenzone, Safe-Areas, Haptik, offline nutzbar |

## 2. Lernmethoden (Stand der Forschung)

1. **Spaced Repetition mit FSRS** (Free Spaced Repetition Scheduler, aktuell bestbewerteter
   Algorithmus, Standard in Anki seit 23.10) – Bibliothek `ts-fsrs`. Bewertung wird
   automatisch aus Antwort, Hinweisen und Antwortzeit abgeleitet (kein lästiges Selbstbewerten).
2. **Active Recall / Testing Effect** – jede Wiederholung ist eine Abrufübung, kein Ansehen.
3. **Generation Effect & Motorisches Lernen** – Kanji selbst schreiben (Nachspuren →
   aus dem Gedächtnis), Strich-für-Strich-Erkennung mit sofortigem Feedback.
4. **Dual Coding** – Bild/Eselsbrücke (Mnemonic) + Zeichen + Bedeutung + Klang (TTS).
5. **Elaboratives Kodieren über Bausteine** – Kanji werden in Komponenten zerlegt
   (aus KanjiVG), Eselsbrücken bauen auf bekannten Bausteinen auf.
6. **Interleaving** – Wiederholungen mischen Aufgabentypen und Kanji.
7. **Desirable Difficulties** – Aufgabentyp steigt mit Stabilität (Erkennen → Abrufen → Schreiben).
8. **Microlearning** – Lektionen mit 3–7 Kanji, 3–5 Minuten.
9. **Kontext** – jedes Kanji mit Beispielwörtern (Lesung + Bedeutung).
10. **Sofortiges, freundliches Feedback** – Fehler werden erklärt, nie bestraft.

## 3. Lerntypen → Funktionen

| Lerntyp | Funktion |
|---|---|
| Visuell | Strichfolge-Animation durch Mo, Bausteine farbig, Eselsbrücke |
| Auditiv | Vorlesen von Lesungen und Wörtern (Web Speech API, ja-JP) |
| Kinästhetisch | Schreibtraining mit Finger: Nachspuren, freies Schreiben |
| Lesen/Schreiben | Beispielwörter, Lesungen, Bedeutungsquiz |
| Spielerisch | Minispiele: Blitzrunde, Paare finden, Tintenregen |

## 4. Inhalte

- **JLPT N5** (~103 Kanji) in **21 thematischen Einheiten**, pädagogisch geordnet
  (einfache Piktogramme zuerst, Bausteine vor zusammengesetzten Zeichen).
- Pro Kanji: deutsche Bedeutungen, On-/Kun-Lesungen, Strichzahl, deutsche Eselsbrücke,
  2–3 Beispielwörter (Wort, Lesung, Bedeutung), Bausteine.
- **Strichdaten**: KanjiVG (CC BY-SA 3.0) – per Skript geladen, als JSON eingebettet,
  Lizenzhinweis in der App („Über Kanjimo“).
- Datenvalidierung per Test: Strichzahl == KanjiVG-Strichanzahl, keine leeren Felder,
  keine doppelten Kanji, jede Einheit referenziert nur existierende Kanji.

## 5. App-Struktur (Screens)

1. **Onboarding** (3 Schritte): Mo stellt sich vor → Tagesziel wählen → erstes Kanji (一) schreiben.
2. **Heute** (Start): Mo-Begrüßung (tageszeitabhängig), Tagesziel-Ring, Serie,
   großer Haupt-Button (nächste sinnvolle Aktion: Wiederholen > Neue Lektion), Schnellzugriffe.
3. **Lernpfad**: geschwungener Pfad der Einheiten, Fortschritt je Einheit, nächste hervorgehoben.
4. **Lektion** (pro Kanji): Mo verwandelt sich ins Kanji → Bedeutung/Lesungen/Eselsbrücke →
   Nachspuren → aus dem Gedächtnis schreiben → Abschlussquiz → Belohnungsbildschirm.
5. **Wiederholung**: fällige Karten (FSRS), gemischte Aufgabentypen:
   Bedeutung wählen, Lesung wählen, Kanji zur Bedeutung wählen, Kanji schreiben.
6. **Spiele**: Blitzrunde (60 s, Combo), Paare finden (Memory), Tintenregen (fallende Kanji).
7. **Sammlung**: Raster aller Kanji, Färbung nach Beherrschung, Detailansicht mit
   Strichfolge, Lesungen, Beispielen, „Üben“-Button.
8. **Profil/Fortschritt**: Level, XP, Serie-Kalender (Heatmap), Statistik, Erfolge.
9. **Einstellungen**: Tagesziel, neue Kanji/Tag, Ton, Haptik, Design (hell/dunkel/auto),
   Strichnummern, Vorlesegeschwindigkeit, Export/Import, Zurücksetzen, Lizenzen.

## 6. Motivation & Gamification

- [x] Tagesziel (XP) mit animiertem Ring, Feier bei Erreichen
- [x] Serie (Streak) + **Serienschutz** (1 Freeze pro 7 Tage Serie, max. 2)
- [x] XP & Level mit sanfter Kurve
- [x] Erfolge (≥ 15), mit Toast-Benachrichtigung
- [x] Mo-Stimmungen: fröhlich, jubelnd, nachdenklich, müde, überrascht, verliebt
- [x] Kontextabhängige Mo-Sprüche (Tageszeit, Serie, Fehler, Erfolg)
- [x] Konfetti/Tintenspritzer bei Erfolgen, Haptik, sanfte Töne (Web Audio, synthetisch)
- [x] Combo-Anzeige in Wiederholung und Spielen
- [x] Highscores pro Spiel

## 7. Technik

- **Vite + React 18 + TypeScript** (strict)
- **vite-plugin-pwa** (Workbox): Precache aller Assets → komplett offline, Update-Hinweis
- **ts-fsrs** für die Planung
- **zustand** + Persistenz in **IndexedDB** (`idb-keyval`), Export/Import als JSON
- Eigenes CSS mit Design-Tokens (hell/dunkel), keine schwere UI-Bibliothek
- Schriften: *M PLUS Rounded 1c* (UI, rund & freundlich), *Klee One* (Kanji in Lehrbuch-Handschrift),
  Workbox-Laufzeitcache für Offline-Nutzung
- Router: schlanker Hash-Router mit Unterstützung für die Zurück-Taste (Android)
- Tests: **Vitest** (Strich-Erkennung, Planung, Gamification-Logik, Datenvalidierung)

### Stricherkennung
1. Nutzerstrich in KanjiVG-Koordinaten (109×109) umrechnen.
2. Beide Striche auf 32 Punkte nach Bogenlänge neu abtasten.
3. Mittlerer Punktabstand, Start-/Endpunkt-Abstand, Längenverhältnis prüfen.
4. Diagnose: richtig / falsche Richtung / falsche Reihenfolge / ungenau.
5. Akzeptierter Strich wird durch den sauberen Referenzstrich ersetzt (Tinten-Animation).
6. Nach 2 Fehlversuchen: Hinweis (Strich blinkt), nach 3: Strich wird vorgemacht.

### Mobile-Politur
- [x] `100dvh`, `env(safe-area-inset-*)`, Theme-Color, Standalone-Display
- [x] Touch-Ziele ≥ 48 px, primäre Aktionen in der Daumenzone (unten)
- [x] `touch-action: none` auf Zeichenflächen, kein Pull-to-Refresh/Overscroll
- [x] Kein Zoom bei Doppeltipp, keine Textauswahl auf Buttons, kein Tap-Highlight
- [x] `prefers-reduced-motion` respektieren
- [x] Haptik via `navigator.vibrate` (wo verfügbar)
- [x] Install-Hinweis (Android: beforeinstallprompt, iOS: Anleitung)
- [x] Zurück-Taste schließt Dialoge / fragt vor Abbruch einer Lektion

## 8. Design

- Farbwelt: Washi-Papier (Creme), Sumi-Tinte (Indigo-Schwarz), Hanko-Rot (Akzent),
  Matcha-Grün (richtig), Sakura-Rosa (Herzchen), Gold (Erfolge).
- Dunkelmodus: Nachttinte-Hintergrund, Papier-Weiß für Kanji.
- Mo: SVG-Tropfen, große glänzende Augen, Bäckchen, Glanzlicht, Atem-Animation, Blinzeln.
- Weiche Ecken, sanfte Schatten, federnde Mikroanimationen (CSS), klare Typografie.

## 9. Qualitätssicherung (Checkliste vor Fertigmeldung)

- [x] `npm run build` ohne Fehler/Warnungen, `tsc` strict sauber
- [x] `npm test` grün
- [x] Onboarding komplett durchgespielt (mobil 390×844)
- [x] Lektion 1 komplett inkl. Schreiben, Quiz, Belohnung
- [x] Wiederholung mit allen Aufgabentypen
- [x] Alle drei Spiele gespielt
- [x] Sammlung + Detail, Strichanimation
- [x] Profil, Erfolge, Einstellungen (Dunkelmodus, Export/Import, Zurücksetzen)
- [x] Neu laden → Fortschritt bleibt erhalten
- [x] Manifest & Service Worker aktiv, App offline startbar
- [x] Keine Konsolenfehler, keine horizontalen Scrollbalken

## 10. Version 1.1

- [x] Helles Design (Washi-Papier, Mo in Sumi-Tusche), Schnellumschalter auf der Startseite
- [x] Alle JLPT-Stufen N5–N1 (2.212 Kanji), Lernpfad & Sammlung mit Stufen-Reitern
- [x] Daten-Pipeline (KanjiVG, KANJIDIC2, JMdict) + deutsche Inhalte, Erfolge je Stufe
- [x] Tests über alle 2.212 Kanji (Daten, jeder Strich erkennbar, keine Fehlakzeptanzen)

## 11. Ausblick

- Vokabel-Modus, Radikal-Lexikon, Eselsbrücken für Namens-Kanji überarbeiten
- Push-Erinnerungen (benötigt Server), Cloud-Sync
- Freundes-Ligen
