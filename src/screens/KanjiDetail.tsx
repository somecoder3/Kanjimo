import { useState } from 'react'
import { KANJI_MAP, UNITS, unitLabel } from '../data/kanji'
import { strokeCount } from '../data/strokes'
import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { mastery, MASTERY_LABEL, retrievability } from '../lib/srs'
import { formatRelative } from '../lib/date'
import { KanjiStrokes } from '../components/KanjiStrokes'
import { KanjiInfo } from '../components/KanjiInfo'
import { TopBar } from '../components/ui'
import { IconPencil, IconReplay } from '../components/Icons'

export function KanjiDetail({ char }: { char: string }) {
  const k = KANJI_MAP[char]
  const p = useStore((s) => s.progress[char])
  const [play, setPlay] = useState(1)
  const [numbers, setNumbers] = useState(true)
  const [colors, setColors] = useState(false)
  const [speed, setSpeed] = useState(1)

  if (!k) {
    return (
      <main className="screen full">
        <TopBar title="Unbekannt" />
        <p className="muted center">Dieses Kanji gibt es (noch) nicht in Kanjimo.</p>
      </main>
    )
  }

  const unit = UNITS.find((u) => u.kanji.includes(char))
  const m = mastery(p?.card)
  const due = p ? new Date(p.card.dueAt) : null

  return (
    <main className="screen full detail">
      <TopBar title={<span className="small muted">{unit ? unitLabel(unit).kicker : ''}</span>} />
      <div className="detail-stage">
        <div className="grid-paper detail-paper">
          <KanjiStrokes char={char} animate playKey={play} speed={speed} showNumbers={numbers} colorParts={colors} withDrop />
        </div>
        <div className="detail-tools">
          <button className="tool-btn" onClick={() => setPlay((n) => n + 1)} aria-label="Strichfolge abspielen">
            <IconReplay />
          </button>
          <button className={`tool-btn ${numbers ? 'on' : ''}`} onClick={() => setNumbers(!numbers)} aria-pressed={numbers} aria-label="Strichnummern">
            123
          </button>
          <button className={`tool-btn ${colors ? 'on' : ''}`} onClick={() => setColors(!colors)} aria-pressed={colors} aria-label="Bausteine einfärben">
            🎨
          </button>
          <button
            className="tool-btn"
            onClick={() => {
              setSpeed(speed === 1 ? 0.5 : speed === 0.5 ? 2 : 1)
              setPlay((n) => n + 1)
            }}
            aria-label="Geschwindigkeit"
          >
            {speed === 1 ? '1×' : speed === 0.5 ? '½×' : '2×'}
          </button>
        </div>
      </div>

      <div className="center" style={{ margin: '8px 0 14px' }}>
        <h1 className="title">{k.meanings.join(', ')}</h1>
        <div className="small muted">
          {strokeCount(char)} {strokeCount(char) === 1 ? 'Strich' : 'Striche'} · JLPT N{k.level ?? 5}
        </div>
      </div>

      <div className={`mastery-card m${m}`}>
        <div className="row">
          <span className={`dot m${m}`} />
          <b style={{ flex: 1 }}>{MASTERY_LABEL[m]}</b>
          {p && <span className="small">{Math.round(retrievability(p.card) * 100)}% Erinnerung</span>}
        </div>
        {p ? (
          <div className="small muted">
            Nächste Wiederholung: {due && due.getTime() <= Date.now() ? 'jetzt fällig' : due ? formatRelative(due) : '–'} · {p.correct}× richtig · {p.wrong}× falsch
          </div>
        ) : (
          <div className="small muted">Noch nicht gelernt – starte die Lektion im Lernpfad.</div>
        )}
      </div>

      <KanjiInfo char={char} linkParts />

      <div className="sticky-bottom">
        <button className="btn block" onClick={() => navigate(`/schreiben/${char}`)}>
          <IconPencil /> Schreiben üben
        </button>
      </div>
    </main>
  )
}
