import { useMemo, useState } from 'react'
import { KANJI_MAP, KANJI_ORDER } from '../data/kanji'
import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { retrievability } from '../lib/srs'
import { XP } from '../lib/gamification'
import { meaningLabel } from '../lib/quiz'
import { sfx, buzz } from '../lib/feedback'
import { SessionHeader, WriteView } from '../components/Session'
import { Mo } from '../components/Mo'
import { Confetti } from '../components/ui'

/** Freies Schreibtraining: einzelnes Kanji (trace → frei) oder Runde mit gelernten Kanji. */
export function WritePractice({ char }: { char?: string }) {
  const progress = useStore((s) => s.progress)
  const recordWrite = useStore((s) => s.recordWrite)
  const addXp = useStore((s) => s.addXp)

  const [round, setRound] = useState(0)
  const plan = useMemo(() => {
    if (char && KANJI_MAP[char]) return [{ c: char, mode: 'trace' as const }, { c: char, mode: 'free' as const }, { c: char, mode: 'free' as const }]
    const learned = Object.keys(progress)
    const base = learned.length ? learned : KANJI_ORDER.slice(0, 5)
    const sorted = [...base].sort((a, b) => (progress[a] ? retrievability(progress[a].card) : 0) - (progress[b] ? retrievability(progress[b].card) : 0))
    return sorted.slice(0, 8).map((c) => ({ c, mode: progress[c] ? ('free' as const) : ('trace' as const) }))
  }, [char, round])

  const [i, setI] = useState(0)
  const [xp, setXp] = useState(0)
  const [done, setDone] = useState(false)
  const [clean, setClean] = useState(0)

  if (done) {
    return (
      <main className="screen full lesson-done">
        <div className="spacer" />
        <div className="center stack" style={{ alignItems: 'center' }}>
          <Mo mood="cheer" size={140} />
          <h1 className="title">Schön geschrieben!</h1>
          <p className="muted">
            {plan.length} Zeichen · {clean} davon fehlerfrei
          </p>
        </div>
        <div className="result-tiles">
          <div className="tile gold">
            <span className="tiny bold">XP</span>
            <b>+{xp}</b>
          </div>
        </div>
        <div className="spacer" />
        <button className="btn block green" onClick={() => navigate(char ? `/kanji/${char}` : '/', { replace: true })}>
          Fertig
        </button>
        {!char && (
          <button className="link-btn" onClick={() => {
              setI(0)
              setXp(0)
              setClean(0)
              setDone(false)
              setRound((r) => r + 1)
            }}>
            Noch eine Runde
          </button>
        )}
        <Confetti fire={1} />
      </main>
    )
  }

  const step = plan[i]
  return (
    <main className="screen full">
      <SessionHeader progress={i / plan.length} guard={i > 0} exitTo={char ? `/kanji/${char}` : '/'} />
      <WriteView
        key={i}
        char={step.c}
        mode={step.mode}
        prompt={
          <>
            <p className="q-label">{step.mode === 'trace' ? 'Spure nach' : i > 0 && char ? 'Nochmal – ohne Vorlage!' : 'Schreibe das Kanji für …'}</p>
            <div className="q-meaning small-q">„{meaningLabel(step.c)}“</div>
          </>
        }
        onDone={(r) => {
          let gained = 0
          if (!r.gaveUp) {
            recordWrite(step.c)
            gained = XP.practiceWrite
            if (r.mistakes === 0 && r.hints === 0) setClean((n) => n + 1)
          }
          sfx.correct()
          buzz.ok()
          const total = xp + gained
          setXp(total)
          if (i + 1 >= plan.length) {
            addXp(total)
            sfx.complete()
            setDone(true)
          } else setI(i + 1)
        }}
      />
    </main>
  )
}
