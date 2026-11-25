import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { meaningLabel } from '../../lib/quiz'
import { shuffle } from '../../lib/random'
import { sfx, buzz } from '../../lib/feedback'
import { navigate } from '../../lib/router'
import { KANJI_MAP } from '../../data/kanji'
import { KanjiStrokes } from '../../components/KanjiStrokes'
import { IconClose, IconDrop } from '../../components/Icons'
import { gamePool } from '../GamesHub'
import { GameOver } from './GameOver'

const PAIRS = 6

interface Card {
  id: number
  char: string
  face: 'kanji' | 'meaning'
}

function pickDistinct(pool: string[], n: number): string[] {
  const out: string[] = []
  for (const c of shuffle(pool)) {
    const ms = KANJI_MAP[c].meanings.map((m) => m.toLowerCase())
    if (out.some((o) => KANJI_MAP[o].meanings.some((m) => ms.includes(m.toLowerCase())))) continue
    out.push(c)
    if (out.length === n) break
  }
  return out
}

export function Pairs() {
  const [round, setRound] = useState(0)
  return <PairsRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

function PairsRound({ onAgain }: { onAgain: () => void }) {
  const progress = useStore((s) => s.progress)
  const [cards] = useState<Card[]>(() => {
    const { pool } = gamePool(progress)
    const chars = pickDistinct(pool, PAIRS)
    return shuffle(chars.flatMap((c, i) => [{ id: i * 2, char: c, face: 'kanji' as const }, { id: i * 2 + 1, char: c, face: 'meaning' as const }]))
  })
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [misses, setMisses] = useState(0)
  const [wrongPair, setWrongPair] = useState<number[]>([])
  const [t0, setT0] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [over, setOver] = useState<null | { score: number; secs: number }>(null)
  const lock = useRef(false)

  useEffect(() => {
    if (t0 === null || over) return
    const id = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(id)
  }, [t0, over])

  const secs = t0 === null ? 0 : Math.max(0, Math.floor((now - t0) / 1000))

  const flip = (idx: number) => {
    if (lock.current || open.includes(idx) || matched.has(cards[idx].char)) return
    if (t0 === null) {
      const t = performance.now()
      setT0(t)
      setNow(t)
    }
    sfx.flip()
    buzz.light()
    const nextOpen = [...open, idx]
    setOpen(nextOpen)
    if (nextOpen.length < 2) return
    lock.current = true
    const [a, b] = nextOpen.map((i) => cards[i])
    if (a.char === b.char) {
      setTimeout(() => {
        sfx.correct()
        buzz.ok()
        const m = new Set(matched)
        m.add(a.char)
        setMatched(m)
        setOpen([])
        lock.current = false
        if (m.size === PAIRS) {
          const total = Math.round((performance.now() - (t0 ?? performance.now())) / 1000)
          const score = Math.max(0, PAIRS * 100 + Math.max(0, 400 - total * 5) - misses * 15)
          setTimeout(() => setOver({ score, secs: total }), 500)
        }
      }, 380)
    } else {
      setTimeout(() => {
        sfx.wrong()
        setWrongPair(nextOpen)
      }, 300)
      setTimeout(() => {
        setMisses((n) => n + 1)
        setWrongPair([])
        setOpen([])
        lock.current = false
      }, 950)
    }
  }

  if (over) {
    return (
      <GameOver
        game="pairs"
        score={over.score}
        xp={Math.min(12, 4 + Math.round(over.score / 150))}
        onAgain={onAgain}
        title="Alle Paare gefunden!"
        details={
          <>
            <div className="tile blue">
              <span className="tiny bold">Zeit</span>
              <b>{over.secs}s</b>
            </div>
            <div className="tile red">
              <span className="tiny bold">Fehlgriffe</span>
              <b>{misses}</b>
            </div>
          </>
        }
      />
    )
  }

  return (
    <main className="screen full game pairs no-select">
      <header className="session-head">
        <button className="icon-btn" aria-label="Spiel beenden" onClick={() => navigate('/spiele', { replace: true })}>
          <IconClose />
        </button>
        <div className="progress">
          <div style={{ width: `${(matched.size / PAIRS) * 100}%` }} />
        </div>
        <span className="score-chip">{secs}s</span>
      </header>
      <p className="q-label center">Finde die Paare: Kanji + Bedeutung</p>
      <div className="pair-grid">
        {cards.map((c, idx) => {
          const isOpen = open.includes(idx) || matched.has(c.char)
          return (
            <button
              key={c.id}
              className={`pair-card ${isOpen ? 'open' : ''} ${matched.has(c.char) ? 'matched' : ''} ${wrongPair.includes(idx) ? 'nope' : ''}`}
              onClick={() => flip(idx)}
              aria-label={isOpen ? (c.face === 'kanji' ? c.char : meaningLabel(c.char)) : 'Verdeckte Karte'}
            >
              <span className="pc-inner">
                <span className="pc-back">
                  <IconDrop />
                </span>
                <span className="pc-front">
                  {c.face === 'kanji' ? (
                    <span className="pc-kanji">
                      <KanjiStrokes char={c.char} strokeWidth={5.5} />
                    </span>
                  ) : (
                    <span className="pc-text">{meaningLabel(c.char)}</span>
                  )}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="small muted center">Fehlgriffe: {misses}</p>
    </main>
  )
}
