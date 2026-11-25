import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { makeQuestion, meaningLabel, type ChoiceQuestion } from '../../lib/quiz'
import { pick } from '../../lib/random'
import { sfx, buzz } from '../../lib/feedback'
import { navigate } from '../../lib/router'
import { KanjiStrokes } from '../../components/KanjiStrokes'
import { IconClose } from '../../components/Icons'
import { gamePool } from '../GamesHub'
import { Countdown, GameOver } from './GameOver'

const LIVES = 3

export function InkRain() {
  const [round, setRound] = useState(0)
  return <RainRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

function RainRound({ onAgain }: { onAgain: () => void }) {
  const progress = useStore((s) => s.progress)
  const [{ pool }] = useState(() => gamePool(progress))
  const [phase, setPhase] = useState<'count' | 'play' | 'over'>('count')
  const [q, setQ] = useState<ChoiceQuestion>(() => makeQuestion(pick(pool), 'meaning', pool) as ChoiceQuestion)
  const [x, setX] = useState(50)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)
  const [caught, setCaught] = useState(0)
  const [combo, setCombo] = useState(0)
  const [state, setState] = useState<'fall' | 'burst' | 'splash'>('fall')
  const [wrongOpt, setWrongOpt] = useState<string | null>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const yRef = useRef(0)
  const speedRef = useRef(1 / 6.5) // Anteil der Feldhöhe pro Sekunde
  const boostRef = useRef(1)
  const livesRef = useRef(LIVES)

  const nextDrop = useCallback(
    (prevChar: string) => {
      let c = pick(pool)
      for (let k = 0; k < 5 && c === prevChar; k++) c = pick(pool)
      setQ(makeQuestion(c, 'meaning', pool) as ChoiceQuestion)
      setX(18 + Math.random() * 64)
      yRef.current = 0
      boostRef.current = 1
      setWrongOpt(null)
      setState('fall')
    },
    [pool],
  )

  useEffect(() => {
    if (phase !== 'play' || state !== 'fall') return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      yRef.current += dt * speedRef.current * boostRef.current
      const field = fieldRef.current
      const drop = dropRef.current
      if (field && drop) {
        const maxY = field.clientHeight - drop.clientHeight
        drop.style.transform = `translate(-50%, ${Math.min(1, yRef.current) * maxY}px)`
      }
      if (yRef.current >= 1) {
        // gelandet → Leben verloren
        sfx.wrong()
        buzz.bad()
        setCombo(0)
        setState('splash')
        livesRef.current -= 1
        const n = livesRef.current
        setLives(n)
        setTimeout(() => (n <= 0 ? setPhase('over') : nextDrop(q.char)), 1100)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, state, q, nextDrop])

  const answer = (o: string) => {
    if (phase !== 'play' || state !== 'fall') return
    if (o === q.answer) {
      const c = combo + 1
      setCombo(c)
      setCaught((n) => n + 1)
      const heightBonus = Math.round((1 - yRef.current) * 10)
      setScore((s) => s + 10 + heightBonus + Math.min(c, 10))
      speedRef.current = Math.min(1 / 2.4, speedRef.current * 1.06)
      sfx.pop()
      sfx.combo(c)
      buzz.ok()
      setState('burst')
      setTimeout(() => nextDrop(q.char), 420)
    } else {
      setCombo(0)
      setWrongOpt(o)
      boostRef.current = 2.2
      sfx.wrong()
      buzz.bad()
      setTimeout(() => setWrongOpt(null), 500)
    }
  }

  if (phase === 'over') {
    return (
      <GameOver
        game="rain"
        score={score}
        xp={Math.min(15, Math.round(score / 30))}
        onAgain={onAgain}
        title="Alle Leben verbraucht!"
        details={
          <div className="tile green">
            <span className="tiny bold">Gefangen</span>
            <b>{caught}</b>
          </div>
        }
      />
    )
  }

  return (
    <main className="screen full game rain no-select">
      <header className="session-head">
        <button className="icon-btn" aria-label="Spiel beenden" onClick={() => navigate('/spiele', { replace: true })}>
          <IconClose />
        </button>
        <div className="hearts" aria-label={`${lives} Leben`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <span key={i} className={i < lives ? 'on' : ''}>
              ♥
            </span>
          ))}
        </div>
        <div className="spacer" />
        <span className="score-chip">{score}</span>
      </header>
      <div className="rain-field" ref={fieldRef}>
        {phase === 'count' && <Countdown onDone={() => setPhase('play')} />}
        {phase === 'play' && (
          <div ref={dropRef} className={`rain-drop ${state}`} style={{ left: `${x}%` }} key={q.char + caught + lives}>
            <svg className="rain-drop-bg" viewBox="0 0 100 120" aria-hidden="true">
              <path d="M50 2 C 56 18, 92 48, 92 76 C 92 100, 73 118, 50 118 C 27 118, 8 100, 8 76 C 8 48, 44 18, 50 2 Z" />
            </svg>
            <span className="rain-kanji">
              <KanjiStrokes char={q.char} strokeWidth={6.5} />
            </span>
          </div>
        )}
        {state === 'splash' && <div className="rain-answer pop-in">{q.char} = {meaningLabel(q.char)}</div>}
        <div className="rain-ground" />
      </div>
      <div className="choices two rain-choices">
        {q.options.map((o) => (
          <button key={o} className={`choice ${wrongOpt === o ? 'wrong' : ''} ${state === 'burst' && o === q.answer ? 'correct' : ''}`} onClick={() => answer(o)} disabled={phase !== 'play'}>
            {o}
          </button>
        ))}
      </div>
    </main>
  )
}
