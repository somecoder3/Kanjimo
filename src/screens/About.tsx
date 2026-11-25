import { TopBar } from '../components/ui'
import { Mo } from '../components/Mo'

export function About() {
  return (
    <main className="screen full about">
      <TopBar title="Über Kanjimo" />
      <div className="center stack" style={{ alignItems: 'center', margin: '8px 0 18px' }}>
        <Mo mood="wink" size={100} />
        <h1 className="ob-logo" style={{ fontSize: '2.2rem' }}>
          Kanji<span>mo</span>
        </h1>
        <p className="muted">
          <span className="jp">漢字</span> Kanji + <span className="jp">文字</span> Moji – „Schriftzeichen“.
        </p>
      </div>

      <div className="card stack small">
        <b>So lernst du mit Kanjimo</b>
        <p>
          <b>Spaced Repetition (FSRS):</b> Ein moderner Algorithmus berechnet für jedes Kanji den idealen Zeitpunkt zum Wiederholen – kurz bevor du es vergessen
          würdest.
        </p>
        <p>
          <b>Aktives Erinnern:</b> Statt nur anzuschauen, rufst du Bedeutung, Lesung und Form selbst ab. Das festigt das Gedächtnis am stärksten.
        </p>
        <p>
          <b>Schreiben mit der Hand:</b> Wer ein Zeichen selbst schreibt, merkt es sich besser. Mo prüft jeden Strich – Lage, Richtung und Reihenfolge.
        </p>
        <p>
          <b>Bilder & Bausteine:</b> Eselsbrücken und farbige Bausteine verbinden Form und Bedeutung.
        </p>
        <p>
          <b>Abwechslung:</b> Gemischte Aufgaben und Spiele halten das Lernen lebendig.
        </p>
      </div>

      <h2 className="section-title">Datenschutz</h2>
      <div className="card small">
        Kanjimo speichert deinen Fortschritt ausschließlich lokal auf deinem Gerät. Es gibt kein Konto, keine Werbung und kein Tracking. Schriften werden lokal
        ausgeliefert.
      </div>

      <h2 className="section-title">Lizenzen</h2>
      <div className="card stack small">
        <p>
          <b>Strichdaten:</b> KanjiVG © Ulrich Apel, lizenziert unter{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">
            CC BY-SA 3.0
          </a>
          .{' '}
          <a href="https://kanjivg.tagaini.net" target="_blank" rel="noreferrer">
            kanjivg.tagaini.net
          </a>
        </p>
        <p>
          <b>Lesungen & Beispielwörter:</b> KANJIDIC2 und JMdict der{' '}
          <a href="https://www.edrdg.org/edrdg/licence.html" target="_blank" rel="noreferrer">
            Electronic Dictionary Research and Development Group
          </a>
          , CC BY-SA 4.0.
        </p>
        <p>
          <b>JLPT-Stufen:</b> Kanji-Listen von Jonathan Waller (tanos.co.uk), CC BY, über kanji-data von David Gouveia.
        </p>
        <p>
          <b>Planung:</b> ts-fsrs (MIT) – Open Spaced Repetition.
        </p>
        <p>
          <b>Schriften:</b> M PLUS Rounded 1c und Klee One (SIL Open Font License).
        </p>
        <p>
          <b>Inhalte:</b> Deutsche Bedeutungen, Eselsbrücken und Beispielauswahl für Kanjimo erstellt.
        </p>
      </div>
    </main>
  )
}
