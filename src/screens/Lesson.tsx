import { useCallback, useMemo, useRef, useState } from 'react'
import { KANJI_MAP, UNITS, unitLabel } from '../data/kanji'
import { strokeCount } from '../data/strokes'
import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { makeQuestion, meaningLabel, type ChoiceQuestion } from '../lib/quiz'
import { shuffle } from '../lib/random'
import { GRADE, type Grade } from '../lib/srs'
import { XP } from '../lib/gamification'
import { sfx, buzz } from '../lib/feedback'
import { ChoiceView, FeedbackBar, SessionHeader, WriteView } from '../components/Session'
import { KanjiStrokes } from '../components/KanjiStrokes'
import { KanjiInfo } from '../components/KanjiInfo'
import { Mo } from '../components/Mo'
import { Confetti, Stars, SpeakButton, TopBar } from '../components/ui'
import { IconReplay } from '../components/Icons'

type Step = { kind: 'intro'; char: string } | { kind: 'trace'; char: string } | { kind: 'free'; char: string } | { kind: 'quiz'; q: ChoiceQuestion; retry?: boolean }

function buildQuiz(chars: string[], pool: string[]): ChoiceQuestion[] {
  const qs: ChoiceQuestion[] = []
  for (const c of chars) {
    qs.push(makeQuestion(c, 'meaning', pool) as ChoiceQuestion)
    qs.push(makeQuestion(c, 'kanji', pool) as ChoiceQuestion)
  }
  // Ein paar Lesungsfragen für Kontext
  for (const c of shuffle(chars.filter((x) => KANJI_MAP[x].examples.length > 0)).slice(0, Math.ceil(chars.length / 2))) qs.push(makeQuestion(c, 'reading', pool) as ChoiceQuestion)
  // Mischen, aber nicht zweimal hintereinander dasselbe Kanji
  let best = shuffle(qs)
  for (let tries = 0; tries < 30; tries++) {
    if (best.every((q, i) => i === 0 || q.char !== best[i - 1].char)) break
    best = shuffle(qs)
  }
  return best
}

export function Lesson({ unitId }: { unitId: number }) {
  const unit = UNITS.find((u) => u.id === unitId)
  if (!unit) {
    return (
      <main className="screen full">
        <TopBar title="Lektion" onBack={() => navigate('/pfad', { replace: true })} />
        <p className="muted center">Diese Lektion gibt es nicht.</p>
      </main>
    )
  }
  return <LessonInner unitId={unit.id} chars={unit.kanji} title={`${unitLabel(unit).kicker} · ${unitLabel(unit).name}`} />
}

function LessonInner({ unitId, chars, title }: { unitId: number; chars: string[]; title: string }) {
  const progress = useStore((s) => s.progress)
  const learnKanji = useStore((s) => s.learnKanji)
  const addXp = useStore((s) => s.addXp)
  const recordUnit = useStore((s) => s.recordUnit)
  const recordWrite = useStore((s) => s.recordWrite)

  const initialSteps = useMemo<Step[]>(() => {
    const pool = [...new Set([...chars, ...Object.keys(progress)])]
    const learn: Step[] = chars.flatMap((c) => [
      { kind: 'intro' as const, char: c },
      { kind: 'trace' as const, char: c },
      { kind: 'free' as const, char: c },
    ])
    return [...learn, ...buildQuiz(chars, pool).map((q) => ({ kind: 'quiz' as const, q }))]
  }, [])

  const [newCount] = useState(() => chars.filter((c) => !progress[c]).length)
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [finished, setFinished] = useState<null | { stars: number; xp: number; accuracy: number }>(null)
  const [fire, setFire] = useState(0)
  const errors = useRef<Record<string, number>>({})
  const quizTotal = useRef(0)
  const quizRight = useRef(0)

  const step = steps[i]
  const total = steps.length

  const finish = useCallback(() => {
    const results = chars.map((c) => {
      const e = errors.current[c] ?? 0
      const grade: Grade = e === 0 ? GRADE.good : e <= 2 ? GRADE.hard : GRADE.again
      return { char: c, grade }
    })
    const totalErrors = Object.values(errors.current).reduce((a, b) => a + b, 0)
    const stars = totalErrors === 0 ? 3 : totalErrors <= Math.ceil(chars.length / 2) ? 2 : 1
    const xp = chars.length * XP.lessonPerKanji + XP.lessonBonus + (stars === 3 ? XP.lessonPerfect : 0)
    learnKanji(results)
    recordUnit(unitId, stars)
    addXp(xp)
    sfx.complete()
    buzz.win()
    setFire((f) => f + 1)
    setFinished({ stars, xp, accuracy: quizTotal.current ? quizRight.current / quizTotal.current : 1 })
  }, [chars, learnKanji, recordUnit, addXp, unitId])

  const next = useCallback(() => {
    setAnswer(null)
    if (i + 1 >= steps.length) finish()
    else setI(i + 1)
  }, [i, steps.length, finish])

  const addError = (c: string, n = 1) => {
    errors.current[c] = (errors.current[c] ?? 0) + n
  }

  if (finished) {
    return (
      <main className="screen full lesson-done">
        <div className="spacer" />
        <div className="center stack" style={{ alignItems: 'center' }}>
          <Mo mood="cheer" size={150} />
          <h1 className="title">Lektion geschafft!</h1>
          <p className="muted">
            {title}
          </p>
          <Stars n={finished.stars} size={46} />
        </div>
        <div className="result-tiles">
          <div className="tile gold">
            <span className="tiny bold">XP</span>
            <b>+{finished.xp}</b>
          </div>
          <div className="tile green">
            <span className="tiny bold">Treffer</span>
            <b>{Math.round(finished.accuracy * 100)}%</b>
          </div>
          <div className="tile blue">
            <span className="tiny bold">Neu</span>
            <b>{newCount}</b>
          </div>
        </div>
        <div className="learned-row jp">
          {chars.map((c, n) => (
            <span key={c} className="pop-in" style={{ animationDelay: `${0.4 + n * 0.1}s` }}>
              {c}
            </span>
          ))}
        </div>
        <p className="small muted center">Mo erinnert dich an diese Kanji, kurz bevor du sie vergessen würdest.</p>
        <div className="spacer" />
        <button className="btn block green" onClick={() => navigate('/pfad', { replace: true })}>
          Weiter
        </button>
        <button className="link-btn" onClick={() => navigate('/', { replace: true })}>
          Zur Startseite
        </button>
        <Confetti fire={fire} />
      </main>
    )
  }

  return (
    <main className="screen full lesson">
      <SessionHeader progress={i / total} guard={i > 0} exitTo="/pfad" />
      {step.kind === 'intro' && <Intro char={step.char} isNew={!progress[step.char]} onNext={next} index={chars.indexOf(step.char)} count={chars.length} />}
      {step.kind === 'trace' && (
        <WriteView
          key={'t' + i}
          char={step.char}
          mode="trace"
          onDone={() => {
            sfx.correct()
            next()
          }}
        />
      )}
      {step.kind === 'free' && (
        <WriteView
          key={'f' + i}
          char={step.char}
          mode="free"
          prompt={
            <>
              <p className="q-label">Jetzt aus dem Gedächtnis!</p>
              <div className="q-meaning small-q">„{meaningLabel(step.char)}“</div>
            </>
          }
          onDone={(r) => {
            const n = strokeCount(step.char)
            if (r.gaveUp) addError(step.char, 2)
            else if (r.hints > 0 || r.mistakes > Math.max(2, n / 2)) addError(step.char)
            if (!r.gaveUp) recordWrite(step.char)
            sfx.correct()
            next()
          }}
        />
      )}
      {step.kind === 'quiz' && (
        <>
          <ChoiceView
            q={step.q}
            answered={answer !== null}
            onAnswer={(ok) => {
              if (!step.retry) {
                quizTotal.current++
                if (ok) quizRight.current++
              }
              if (!ok) {
                addError(step.q.char)
                // Falsche Frage später nochmals stellen
                if (!step.retry) setSteps((s) => [...s, { kind: 'quiz', q: { ...step.q, options: shuffle(step.q.options) }, retry: true }])
              }
              setAnswer(ok)
            }}
          />
          {answer !== null && <FeedbackBar ok={answer} char={step.q.char} onNext={next} auto={answer} />}
        </>
      )}
    </main>
  )
}

function Intro({ char, onNext, isNew, index, count }: { char: string; onNext: () => void; isNew: boolean; index: number; count: number }) {
  const k = KANJI_MAP[char]
  const [play, setPlay] = useState(1)
  const [drawn, setDrawn] = useState(false)
  const showNumbers = useStore((s) => s.settings.strokeNumbers)
  return (
    <div className="intro fade-up">
      <div className="intro-top">
        <span className="pill small">
          {isNew ? '✨ Neues Kanji' : 'Auffrischen'} · {index + 1}/{count}
        </span>
      </div>
      <div className="intro-stage">
        <div className={`intro-mo ${drawn ? 'out' : 'dive'}`} key={'mo' + play}>
          <Mo mood={drawn ? 'cheer' : 'happy'} size={drawn ? 64 : 70} />
        </div>
        <div className="grid-paper intro-paper">
          <KanjiStrokes
            char={char}
            animate
            withDrop
            playKey={play}
            showNumbers={showNumbers || drawn}
            colorParts={drawn}
            speed={0.8}
            onDone={() => {
              setDrawn(true)
              sfx.pop()
            }}
          />
        </div>
        <button
          className="replay-btn"
          aria-label="Strichfolge nochmal zeigen"
          onClick={() => {
            setDrawn(false)
            setPlay((p) => p + 1)
          }}
        >
          <IconReplay />
        </button>
      </div>
      <div className="intro-meaning">
        <h1 className="title">{k.meanings.join(', ')}</h1>
        <span className="small muted">
          {strokeCount(char)} {strokeCount(char) === 1 ? 'Strich' : 'Striche'}
        </span>
        {k.kun[0] && <SpeakButton text={k.kun[0].replace(/[.-]/g, '')} small />}
      </div>
      <KanjiInfo char={char} />
      <div className="sticky-bottom">
        <button className="btn block" onClick={onNext}>
          Nachspuren
        </button>
      </div>
    </div>
  )
}
