import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Mo } from '../../components/Mo'
import { Confetti } from '../../components/ui'
import { navigate } from '../../lib/router'
import { useStore } from '../../lib/store'
import { sfx, buzz } from '../../lib/feedback'

/** Gemeinsamer Abschlussbildschirm der Spiele – speichert Rekord und XP genau einmal. */
export function GameOver({ game, score, xp, details, onAgain, title }: { game: string; score: number; xp: number; details?: ReactNode; onAgain: () => void; title?: string }) {
  const saved = useRef(false)
  const [record, setRecord] = useState(false)
  const prev = useRef(useStore.getState().stats.highscores[game] ?? 0)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const isRecord = useStore.getState().recordGame(game, score)
    setRecord(isRecord)
    if (xp > 0) useStore.getState().addXp(xp)
    sfx.complete()
    buzz.win()
  }, [game, score, xp])
  const best = Math.max(prev.current, score)
  return (
    <main className="screen full lesson-done">
      <div className="spacer" />
      <div className="center stack" style={{ alignItems: 'center' }}>
        <Mo mood={record ? 'love' : score > 0 ? 'cheer' : 'happy'} size={130} />
        <h1 className="title">{record ? 'Neuer Rekord!' : (title ?? 'Spiel vorbei!')}</h1>
        <div className="big-score">{score}</div>
        <p className="muted small">Punkte · Rekord {best}</p>
      </div>
      <div className="result-tiles">
        <div className="tile gold">
          <span className="tiny bold">XP</span>
          <b>+{xp}</b>
        </div>
        {details}
      </div>
      <div className="spacer" />
      <button className="btn block" onClick={onAgain}>
        Nochmal spielen
      </button>
      <button className="link-btn" onClick={() => navigate('/spiele', { replace: true })}>
        Zurück zu den Spielen
      </button>
      <Confetti fire={record || score > 0 ? 1 : 0} />
    </main>
  )
}

/** Countdown 3-2-1 vor dem Spielstart. */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    if (n === 0) {
      onDone()
      return
    }
    sfx.tick()
    const t = setTimeout(() => setN(n - 1), 650)
    return () => clearTimeout(t)
  }, [n, onDone])
  return (
    <div className="countdown" aria-live="assertive">
      <span key={n} className="cd-num">
        {n || 'Los!'}
      </span>
    </div>
  )
}
