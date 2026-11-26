import { useEffect, useRef, useState } from 'react'
import { UNITS, KANJI_MAP, LEVELS, unitsOfLevel, type Unit } from '../data/kanji'
import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { mastery } from '../lib/srs'
import { Mo } from '../components/Mo'
import { Sheet, Stars } from '../components/ui'
import { IconLock, IconCheck } from '../components/Icons'
import { sfx, buzz } from '../lib/feedback'
import { meaningLabel } from '../lib/quiz'

const LEVEL_NAMES: Record<number, string> = {
  5: 'Grundlagen',
  4: 'Alltag',
  3: 'Mittelstufe',
  2: 'Fortgeschritten',
  1: 'Meisterschaft',
}

let rememberedLevel: number | null = null

export function PathScreen() {
  const units = useStore((s) => s.units)
  const progress = useStore((s) => s.progress)
  const [open, setOpen] = useState<Unit | null>(null)
  const currentRef = useRef<HTMLDivElement>(null)
  const current = UNITS.find((u) => !units[u.id])
  const [level, setLevel] = useState<number>(rememberedLevel ?? current?.level ?? 5)
  const list = unitsOfLevel(level)
  const doneCount = list.filter((u) => units[u.id]).length
  const kanjiCount = list.reduce((a, u) => a + u.kanji.length, 0)

  useEffect(() => {
    rememberedLevel = level
    if (current?.level === level) currentRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' })
    else window.scrollTo(0, 0)
  }, [level, current?.level])

  const unlocked = (u: Unit) => u.id === 1 || !!units[u.id - 1] || !!units[u.id]

  return (
    <main className="screen path-screen">
      <header className="path-head">
        <div className="row">
          <div style={{ flex: 1 }}>
            <div className="title">Lernpfad</div>
            <div className="small muted">
              JLPT N{level} · {LEVEL_NAMES[level]} · {doneCount}/{list.length} Einheiten · {kanjiCount} Kanji
            </div>
          </div>
        </div>
        <div className="level-tabs" role="tablist" aria-label="JLPT-Stufe">
          {LEVELS.map((l) => {
            const lu = unitsOfLevel(l)
            const done = lu.length > 0 && lu.every((u) => units[u.id])
            return (
              <button
                key={l}
                role="tab"
                aria-selected={level === l}
                className={`level-tab ${level === l ? 'on' : ''} ${done ? 'done' : ''}`}
                onClick={() => {
                  sfx.tap()
                  setLevel(l)
                }}
              >
                N{l}
                {done && <span className="lt-check">✓</span>}
              </button>
            )
          })}
        </div>
        <div className="progress" style={{ marginTop: 10 }}>
          <div style={{ width: `${list.length ? (doneCount / list.length) * 100 : 0}%` }} />
        </div>
      </header>

      <div className="path">
        {list.map((u, i) => {
          const done = !!units[u.id]
          const isCurrent = u.id === current?.id
          const isOpen = unlocked(u)
          const offset = Math.sin(i * 0.9) * 32
          const learnedHere = u.kanji.filter((c) => progress[c]).length
          const avgMastery = learnedHere ? u.kanji.reduce((a, c) => a + mastery(progress[c]?.card), 0) / u.kanji.length : 0
          const emoji = !/[㐀-鿿]/.test(u.icon)
          return (
            <div key={u.id} className="path-item" style={{ transform: `translateX(${offset}%)` }} ref={isCurrent ? currentRef : undefined}>
              {isCurrent && (
                <div className="path-mo" style={{ [offset > 0 ? 'right' : 'left']: '100%' } as React.CSSProperties}>
                  <Mo mood="happy" size={58} />
                </div>
              )}
              <button
                className={`node ${done ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isOpen ? '' : 'locked'}`}
                onClick={() => {
                  sfx.tap()
                  buzz.light()
                  setOpen(u)
                }}
                aria-label={`Einheit ${u.title}${done ? ', abgeschlossen' : isOpen ? '' : ', gesperrt'}`}
              >
                <span className="node-face">
                  {isOpen ? <span className={emoji ? 'node-emoji' : 'node-kanji jp'}>{u.icon}</span> : <IconLock />}
                  {done && avgMastery >= 3 && <span className="node-crown">👑</span>}
                </span>
              </button>
              <div className="node-label">
                <b>{u.level === 5 ? u.title : u.subtitle}</b>
                <span className="jp">{u.kanji.join('')}</span>
                {done && <Stars n={units[u.id].stars} size={16} />}
              </div>
            </div>
          )
        })}
        <div className="path-end">
          <span style={{ fontSize: '2.4rem' }}>{level === 1 ? '🏯' : '⛩️'}</span>
          <b>{level === 1 ? 'Alle JLPT-Kanji!' : `Ende von N${level}`}</b>
          {level > 1 && (
            <button className="link-btn" onClick={() => setLevel(level - 1)}>
              Weiter zu N{level - 1} →
            </button>
          )}
        </div>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} label={open?.title}>
        {open && <UnitSheet unit={open} unlocked={unlocked(open)} onClose={() => setOpen(null)} />}
      </Sheet>
    </main>
  )
}

function UnitSheet({ unit, unlocked, onClose }: { unit: Unit; unlocked: boolean; onClose: () => void }) {
  const done = useStore((s) => s.units[unit.id])
  const progress = useStore((s) => s.progress)
  const prev = UNITS.find((u) => u.id === unit.id - 1)
  const emoji = !/[㐀-鿿]/.test(unit.icon)
  return (
    <div className="stack">
      <div className="row">
        <span className={`unit-emoji ${emoji ? '' : 'jp'}`}>{unit.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tiny bold faint">
            JLPT N{unit.level} · {unit.level === 5 ? `EINHEIT ${unit.id}` : unit.title.toUpperCase()}
          </div>
          <div className="title" style={{ fontSize: '1.3rem' }}>
            {unit.level === 5 ? unit.title : unit.subtitle}
          </div>
          {unit.level === 5 && <div className="small muted">{unit.subtitle}</div>}
        </div>
        {done && <Stars n={done.stars} size={20} />}
      </div>
      <div className="unit-kanji">
        {unit.kanji.map((c) => (
          <button
            key={c}
            className={`uk m${mastery(progress[c]?.card)}`}
            onClick={() => {
              onClose()
              navigate(`/kanji/${c}`)
            }}
          >
            <span className="jp">{c}</span>
            <span className="tiny">{meaningLabel(c).split(',')[0]}</span>
            {progress[c] && <IconCheck className="uk-check" />}
          </button>
        ))}
      </div>
      {!unlocked && prev && (
        <p className="small muted center">
          Tipp: Schließe zuerst die vorige Einheit ab. Wenn du die Kanji schon kennst, kannst du aber auch direkt starten.
        </p>
      )}
      {done && (
        <button
          className="btn block"
          onClick={() => {
            onClose()
            navigate(`/wiederholen/einheit/${unit.id}`)
          }}
        >
          Nur Quiz
        </button>
      )}
      <button
        className={`btn block ${done ? 'light' : ''}`}
        onClick={() => {
          onClose()
          navigate(`/lektion/${unit.id}`)
        }}
      >
        {done ? 'Ganze Lektion mit Schreiben' : unlocked ? 'Lektion starten' : 'Trotzdem starten'}
      </button>
      <p className="tiny faint center">
        {unit.kanji.length} Kanji · ca. {Math.round(unit.kanji.length * 1.1)} Min. · {unit.kanji.map((c) => KANJI_MAP[c].meanings[0]).join(', ')}
      </p>
    </div>
  )
}
