import { useState } from 'react'
import { KANJI_ORDER, LEVELS, levelOf, unitsOfLevel } from '../data/kanji'
import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { isDue, mastery, MASTERY_LABEL } from '../lib/srs'

type Filter = 'all' | 'learned' | 'due' | 'new'

let rememberedLevel = 5
let rememberedFilter: Filter = 'all'

export function Collection() {
  const progress = useStore((s) => s.progress)
  const [filter, setFilterState] = useState<Filter>(rememberedFilter)
  const [level, setLevelState] = useState<number>(rememberedLevel)
  const setFilter = (f: Filter) => setFilterState((rememberedFilter = f))
  const setLevel = (l: number) => {
    setLevelState((rememberedLevel = l))
    window.scrollTo(0, 0)
  }
  const inLevel = KANJI_ORDER.filter((c) => levelOf(c) === level)
  const learnedAll = Object.keys(progress).length
  const learned = inLevel.filter((c) => progress[c]).length
  const counts = [0, 0, 0, 0, 0]
  inLevel.forEach((c) => counts[mastery(progress[c]?.card)]++)

  const show = (c: string) => {
    const p = progress[c]
    if (filter === 'learned') return !!p
    if (filter === 'new') return !p
    if (filter === 'due') return !!p && isDue(p.card)
    return true
  }

  return (
    <main className="screen collection">
      <header style={{ marginBottom: 10 }}>
        <div className="title">Sammlung</div>
        <div className="small muted">
          {learnedAll} von {KANJI_ORDER.length} Kanji gelernt · N{level}: {learned}/{inLevel.length}
        </div>
      </header>

      <div className="level-tabs" role="tablist" aria-label="JLPT-Stufe" style={{ marginBottom: 12 }}>
        {LEVELS.map((l) => (
          <button key={l} role="tab" aria-selected={level === l} className={`level-tab ${level === l ? 'on' : ''}`} onClick={() => setLevel(l)}>
            N{l}
          </button>
        ))}
      </div>

      <div className="mastery-bar" aria-label="Verteilung nach Beherrschung">
        {[1, 2, 3, 4].map((m) => (counts[m] ? <div key={m} className={`mb m${m}`} style={{ flex: counts[m] }} /> : null))}
        {counts[0] > 0 && <div className="mb m0" style={{ flex: counts[0] }} />}
      </div>
      <div className="mastery-legend">
        {[1, 2, 3, 4].map((m) => (
          <span key={m}>
            <i className={`dot m${m}`} />
            {MASTERY_LABEL[m]} {counts[m]}
          </span>
        ))}
      </div>

      <div className="segmented" role="group" aria-label="Filter" style={{ margin: '14px 0 4px' }}>
        {(
          [
            ['all', 'Alle'],
            ['learned', 'Gelernt'],
            ['due', 'Fällig'],
            ['new', 'Neu'],
          ] as [Filter, string][]
        ).map(([f, l]) => (
          <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {l}
          </button>
        ))}
      </div>

      {unitsOfLevel(level).map((u) => {
        const list = u.kanji.filter(show)
        if (list.length === 0) return null
        return (
          <section key={u.id} className="kgroup">
            <h2 className="section-title">{u.level === 5 ? `${u.icon} ${u.title}` : `${u.title} · ${u.subtitle}`}</h2>
            <div className="kgrid">
              {list.map((c) => {
                const p = progress[c]
                const m = mastery(p?.card)
                return (
                  <button key={c} className={`kcell m${m} ${p && isDue(p.card) ? 'due' : ''}`} onClick={() => navigate(`/kanji/${c}`)} aria-label={`${c}, ${MASTERY_LABEL[m]}`}>
                    <span className="kcell-char jp">{c}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
      {inLevel.filter(show).length === 0 && (
        <p className="center muted" style={{ marginTop: 40 }}>
          {filter === 'due' ? 'Gerade ist nichts fällig. 🎉' : 'Hier ist noch nichts.'}
        </p>
      )}
    </main>
  )
}
