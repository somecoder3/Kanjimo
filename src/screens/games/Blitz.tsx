import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { makeQuestion, meaningLabel, type ChoiceQuestion } from '../../lib/quiz'
import { pick } from '../../lib/random'
import { sfx, buzz } from '../../lib/feedback'
import { navigate } from '../../lib/router'
import { KanjiStrokes } from '../../components/KanjiStrokes'
import { IconClose, IconFlame } from '../../components/Icons'
import { gamePool } from '../GamesHub'
import { Countdown, GameOver } from './GameOver'

const DURATION = 60_000
const PENALTY = 3_000

export function Blitz() {
  const [round, setRound] = useState(0)
  return <BlitzRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

function BlitzRound({ onAgain }: { onAgain: () => void }) {
  const progress = useStore((s) => s.progress)
  const [{ pool }] = useState(() => gamePool(progress))
  const [phase, setPhase] = useState<'count' | 'play' | 'over'>('count')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [q, setQ] = useState<ChoiceQuestion>(() => newQ(pool, ''))
  const [flash, setFlash] = useState<{ opt: string; ok: boolean } | null>(null)
  const [left, setLeft] = useState(DURATION)
  const [penalty, setPenalty] = useState(0)
  const endAt = useRef(0)

  function newQ(p: string[], prev: string): ChoiceQuestion {
    let c = pick(p)
    for (let k = 0; k < 5 && c === prev; k++) c = pick(p)
    return makeQuestion(c, Math.random() < 0.6 ? 'meaning' : 'kanji', p) as ChoiceQuestion
  }

  const start = useCallback(() => {
    endAt.current = performance.now() + DURATION
    setPhase('play')
  }, [])

  useEffect(() => {
    if (phase !== 'play') return
    let raf = 0
    const tick = () => {
      const l = endAt.current - performance.now()
      setLeft(Math.max(0, l))
      if (l <= 0) {
        setPhase('over')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const answer = (o: string) => {
    if (flash || phase !== 'play') return
    const ok = o === q.answer
    setFlash({ opt: o, ok })
    if (ok) {
      const c = combo + 1
      const mult = Math.min(4, 1 + Math.floor(c / 5))
      setCombo(c)
      setBest((b) => Math.max(b, c))
      setScore((s) => s + 10 * mult)
      setRight((n) => n + 1)
      sfx.combo(c)
      buzz.light()
    } else {
      setCombo(0)
      setWrong((n) => n + 1)
      endAt.current -= PENALTY
      setPenalty((n) => n + 1)
      sfx.wrong()
      buzz.bad()
    }
    setTimeout(
      () => {
        setFlash(null)
        setQ((prev) => newQ(pool, prev.char))
      },
      ok ? 220 : 650,
    )
  }

  if (phase === 'over') {
    return (
      <GameOver
        game="blitz"
        score={score}
        xp={Math.min(15, Math.round(score / 25))}
        onAgain={onAgain}
        title="Zeit um!"
        details={
          <>
            <div className="tile green">
              <span className="tiny bold">Richtig</span>
              <b>{right}</b>
            </div>
            <div className="tile red">
              <span className="tiny bold">Combo</span>
              <b>{best}</b>
            </div>
          </>
        }
      />
    )
  }

  const mult = Math.min(4, 1 + Math.floor(combo / 5))
  return (
    <main className="screen full game blitz no-select">
      <header className="session-head">
        <button className="icon-btn" aria-label="Spiel beenden" onClick={() => navigate('/spiele', { replace: true })}>
          <IconClose />
        </button>
        <div className={`progress timer ${left < 10_000 ? 'low' : ''}`}>
          <div style={{ width: `${(left / DURATION) * 100}%`, transition: 'none' }} />
        </div>
        <span className="score-chip">{score}</span>
      </header>
      {phase === 'count' && <Countdown onDone={start} />}
      {phase === 'play' && (
        <div className="question" key={q.char + q.type + score + wrong}>
          <div className="row" style={{ justifyContent: 'center', gap: 8, minHeight: 34 }}>
            {combo >= 3 && (
              <span className="combo">
                <IconFlame /> {combo}
              </span>
            )}
            {mult > 1 && <span className="pill small mult">×{mult}</span>}
            {penalty > 0 && flash && !flash.ok && <span className="pill small penalty">−3 s</span>}
          </div>
          <p className="q-label center">{q.type === 'meaning' ? 'Was bedeutet …' : 'Welches Kanji ist …'}</p>
          {q.type === 'meaning' ? (
            <div className="q-kanji blitz-kanji">
              <KanjiStrokes char={q.char} strokeWidth={4.8} />
            </div>
          ) : (
            <div className="q-meaning blitz-meaning">„{meaningLabel(q.char)}“</div>
          )}
          <div className={`choices two ${q.type === 'kanji' ? 'kanji-grid' : ''}`}>
            {q.options.map((o) => (
              <button
                key={o}
                className={`choice ${q.type === 'kanji' ? 'kanji-choice' : ''} ${flash ? (o === q.answer ? 'correct' : o === flash.opt ? 'wrong' : 'dim') : ''}`}
                onClick={() => answer(o)}
              >
                {q.type === 'kanji' ? (
                  <span className="choice-kanji">
                    <KanjiStrokes char={o} strokeWidth={5.5} />
                  </span>
                ) : (
                  o
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
