import { useCallback, useMemo, useRef, useState } from 'react'
import { KANJI_ORDER } from '../data/kanji'
import { strokeCount } from '../data/strokes'
import { dueChars, useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { makeQuestion, pickType, type Question } from '../lib/quiz'
import { shuffle } from '../lib/random'
import { GRADE, retrievability, type Grade } from '../lib/srs'
import { XP } from '../lib/gamification'
import { formatRelative } from '../lib/date'
import { sfx, buzz } from '../lib/feedback'
import { ChoiceView, FeedbackBar, SessionHeader, WriteView } from '../components/Session'
import { Mo } from '../components/Mo'
import { Confetti, TopBar } from '../components/ui'

interface Item {
  q: Question
  retry: boolean
}

export function Review({ practice = false }: { practice?: boolean }) {
  const progress = useStore((s) => s.progress)
  const settings = useStore((s) => s.settings)
  const recordReview = useStore((s) => s.recordReview)
  const finishSession = useStore((s) => s.finishSession)
  const addXp = useStore((s) => s.addXp)

  const initial = useMemo<Item[]>(() => {
    const learned = Object.keys(progress)
    let chars: string[]
    if (practice) {
      // Freies Üben: die am wenigsten sicheren Kanji zuerst
      chars = [...learned].sort((a, b) => retrievability(progress[a].card) - retrievability(progress[b].card)).slice(0, 12)
    } else {
      chars = dueChars(progress).slice(0, settings.reviewBatch)
    }
    const pool = learned.length >= 4 ? learned : KANJI_ORDER.slice(0, 12)
    return shuffle(chars).map((c) => {
      const t = pickType(progress[c]?.card, settings.writingInReviews)
      const hard = (progress[c]?.card.stability ?? 0) > 10
      return { q: makeQuestion(c, t, pool, hard), retry: false }
    })
  }, [])

  const [items, setItems] = useState(initial)
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [combo, setCombo] = useState(0)
  const [done, setDone] = useState<null | { right: number; total: number; xp: number; best: number }>(null)
  const [fire, setFire] = useState(0)
  const stats = useRef({ right: 0, total: 0, xp: 0, best: 0, mistakes: 0 })

  const finish = useCallback(() => {
    const st = stats.current
    finishSession({ perfect: st.mistakes === 0, combo: st.best, count: st.total })
    if (st.xp > 0) addXp(st.xp)
    sfx.complete()
    buzz.win()
    if (st.total > 0 && st.right / st.total >= 0.8) setFire((f) => f + 1)
    setDone({ right: st.right, total: st.total, xp: st.xp, best: st.best })
  }, [finishSession, addXp])

  const next = useCallback(() => {
    setAnswer(null)
    if (i + 1 >= items.length) finish()
    else setI(i + 1)
  }, [i, items.length, finish])

  const grade = (item: Item, ok: boolean, ms: number, write?: { mistakes: number; hints: number }): Grade => {
    if (!ok) return GRADE.again
    if (item.retry) return GRADE.good
    const card = progress[item.q.char]?.card
    if (write) {
      const n = strokeCount(item.q.char)
      if (write.hints > 0 || write.mistakes > Math.max(2, n / 2)) return GRADE.hard
      return GRADE.good
    }
    if (ms > 12000) return GRADE.hard
    if (ms < 2200 && (card?.reps ?? 0) >= 3) return GRADE.easy
    return GRADE.good
  }

  const record = (ok: boolean, ms: number, write?: { mistakes: number; hints: number }) => {
    const item = items[i]
    const g = grade(item, ok, ms, write)
    if (!practice) recordReview({ char: item.q.char, grade: g, correct: ok, write: !!write })
    else if (write && ok) useStore.getState().recordWrite(item.q.char)
    const st = stats.current
    if (!item.retry) {
      st.total++
      if (ok) st.right++
    }
    if (ok) {
      const c = combo + 1
      setCombo(c)
      st.best = Math.max(st.best, c)
      if (c >= 3) sfx.combo(c)
      st.xp += XP.reviewCorrect + (write ? XP.reviewWrite : 0) + (c >= 5 ? XP.comboBonus : 0)
    } else {
      st.mistakes++
      setCombo(0)
      if (!item.retry) {
        // später in dieser Runde erneut abfragen – als leichtere Auswahlfrage
        const pool = Object.keys(progress)
        const retryQ = makeQuestion(item.q.char, item.q.type === 'meaning' ? 'kanji' : 'meaning', pool.length >= 4 ? pool : KANJI_ORDER.slice(0, 12))
        setItems((list) => {
          const pos = Math.min(list.length, i + 3 + Math.floor(Math.random() * 3))
          return [...list.slice(0, pos), { q: retryQ, retry: true }, ...list.slice(pos)]
        })
      }
    }
    setAnswer(ok)
  }

  if (items.length === 0) return <NothingDue />

  if (done) {
    const acc = done.total ? done.right / done.total : 1
    const mood = acc >= 0.9 ? 'cheer' : acc >= 0.6 ? 'happy' : 'think'
    return (
      <main className="screen full lesson-done">
        <div className="spacer" />
        <div className="center stack" style={{ alignItems: 'center' }}>
          <Mo mood={mood} size={140} />
          <h1 className="title">{acc === 1 ? 'Fehlerfrei! Wahnsinn!' : acc >= 0.8 ? 'Starke Runde!' : acc >= 0.5 ? 'Gut gemacht!' : 'Dranbleiben lohnt sich!'}</h1>
          <p className="muted">
            {acc >= 0.8
              ? 'Dein Gedächtnis wird immer stärker.'
              : 'Die schwierigen Kanji kommen bald wieder – Wiederholung macht den Meister.'}
          </p>
        </div>
        <div className="result-tiles">
          <div className="tile gold">
            <span className="tiny bold">XP</span>
            <b>+{done.xp}</b>
          </div>
          <div className="tile green">
            <span className="tiny bold">Treffer</span>
            <b>{Math.round(acc * 100)}%</b>
          </div>
          <div className="tile red">
            <span className="tiny bold">Combo</span>
            <b>{done.best}</b>
          </div>
        </div>
        <div className="spacer" />
        <button className="btn block green" onClick={() => navigate('/', { replace: true })}>
          Fertig
        </button>
        <Confetti fire={fire} />
      </main>
    )
  }

  const item = items[i]
  return (
    <main className="screen full review">
      <SessionHeader progress={i / items.length} combo={combo} guard={i > 0 || answer !== null} exitTo="/" />
      {practice && <div className="pill small" style={{ alignSelf: 'center', margin: '-4px 0 10px' }}>Freies Üben · beeinflusst die Planung nicht</div>}
      {item.q.type === 'write' ? (
        <WriteView
          key={'w' + i}
          char={item.q.char}
          mode="free"
          onDone={(r) => {
            if (r.gaveUp) {
              record(false, 0)
            } else {
              sfx.correct()
              buzz.ok()
              record(true, r.ms, { mistakes: r.mistakes, hints: r.hints })
            }
          }}
        />
      ) : (
        <ChoiceView key={'c' + i} q={item.q} answered={answer !== null} onAnswer={(ok, ms) => record(ok, ms)} />
      )}
      {answer !== null && (
        <FeedbackBar
          ok={answer}
          char={item.q.char}
          onNext={next}
          auto={answer && item.q.type !== 'write'}
          title={item.q.type === 'write' && answer ? 'Schön geschrieben!' : undefined}
        />
      )}
    </main>
  )
}

function NothingDue() {
  const progress = useStore((s) => s.progress)
  const learned = Object.keys(progress).length
  const nextDue = Object.values(progress)
    .map((p) => new Date(p.card.dueAt))
    .sort((a, b) => a.getTime() - b.getTime())[0]
  return (
    <main className="screen full">
      <TopBar title="Wiederholen" close onBack={() => navigate('/', { replace: true })} />
      <div className="spacer" />
      <div className="center stack" style={{ alignItems: 'center' }}>
        <Mo mood={learned ? 'sleep' : 'think'} size={140} />
        <h1 className="title">{learned ? 'Alles wiederholt!' : 'Noch nichts zu wiederholen'}</h1>
        <p className="muted">
          {learned
            ? `Dein Gedächtnis ist gerade top in Form. Nächste Wiederholung ${nextDue ? formatRelative(nextDue) : 'bald'}.`
            : 'Lerne zuerst ein paar Kanji im Lernpfad.'}
        </p>
      </div>
      <div className="spacer" />
      {learned >= 1 ? (
        <button className="btn block light" onClick={() => navigate('/wiederholen/ueben', { replace: true })}>
          Trotzdem üben
        </button>
      ) : (
        <button className="btn block" onClick={() => navigate('/pfad', { replace: true })}>
          Zum Lernpfad
        </button>
      )}
    </main>
  )
}

