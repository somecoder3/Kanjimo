import { useEffect, useRef, useState, type ReactNode } from 'react'
import { KANJI_MAP } from '../data/kanji'
import { strokeCount } from '../data/strokes'
import { meaningLabel, type ChoiceQuestion } from '../lib/quiz'
import { setLeaveGuard, navigate } from '../lib/router'
import { sfx, buzz } from '../lib/feedback'
import { speak, hasJapaneseVoice } from '../lib/speech'
import { useStore } from '../lib/store'
import { KanjiStrokes } from './KanjiStrokes'
import { WritingPad, type WriteResult } from './WritingPad'
import { Confirm, SpeakButton } from './ui'
import { IconBulb, IconClose, IconFlame, IconCheck, IconReplay } from './Icons'
import { Mo, type MoMood } from './Mo'
import type { StrokeVerdict } from '../lib/geometry'
import { pick } from '../lib/random'

/* ───────── Sitzungs-Kopf mit Abbruch-Schutz ───────── */
export function SessionHeader({ progress, combo = 0, guard, exitTo = '/', right }: { progress: number; combo?: number; guard: boolean; exitTo?: string; right?: ReactNode }) {
  const [ask, setAsk] = useState<string | null>(null)
  useEffect(() => {
    if (!guard) {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard((target) => {
      setAsk(target)
      return false
    })
    return () => setLeaveGuard(null)
  }, [guard])
  return (
    <>
      <header className="session-head">
        <button className="icon-btn" aria-label="Beenden" onClick={() => (guard ? setAsk(exitTo) : navigate(exitTo))}>
          <IconClose />
        </button>
        <div className="progress">
          <div style={{ width: `${Math.max(2, progress * 100)}%` }} />
        </div>
        {combo >= 3 ? (
          <span className="combo" key={combo}>
            <IconFlame />
            {combo}
          </span>
        ) : (
          right
        )}
      </header>
      <Confirm
        open={ask !== null}
        art={<Mo mood="sad" size={90} />}
        title="Wirklich aufhören?"
        text="Mo wäre ein bisschen traurig. Dein Fortschritt in dieser Runde geht verloren."
        cancelLabel="Weiterlernen"
        confirmLabel="Beenden"
        danger
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          const t = ask ?? exitTo
          setAsk(null)
          setLeaveGuard(null)
          navigate(t, { replace: true, force: true })
        }}
      />
    </>
  )
}

/* ───────── Feedback-Leiste ───────── */
const PRAISE = ['Super!', 'Richtig!', 'Klasse!', 'Genau!', 'Toll gemacht!', 'Perfekt!', 'Sehr gut!']

export function FeedbackBar({ ok, char, onNext, title, auto = false, extra }: { ok: boolean; char: string; onNext: () => void; title?: string; auto?: boolean; extra?: ReactNode }) {
  const k = KANJI_MAP[char]
  const [praise] = useState(() => pick(PRAISE))
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    btn.current?.focus({ preventScroll: true })
    if (!auto) return
    const t = setTimeout(onNext, 1300)
    return () => clearTimeout(t)
  }, [auto, onNext])
  return (
    <div className={`feedback ${ok ? 'good' : 'bad'}`} role="status">
      <div className="fb-title">
        {ok ? <IconCheck width={26} height={26} /> : <span aria-hidden="true">✗</span>}
        {title ?? (ok ? praise : 'Nicht ganz …')}
      </div>
      <div className="fb-body">
        <span className="fb-kanji">
          <KanjiStrokes char={char} strokeWidth={6} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bold">{meaningLabel(char)}</div>
          <div className="small">
            {[...k.kun.slice(0, 1), ...k.on.slice(0, 1)].map((r) => r.replace('.', '')).join(' · ')}
          </div>
          {extra}
        </div>
      </div>
      <button ref={btn} className={`btn block ${ok ? 'green' : 'red'}`} onClick={onNext}>
        Weiter
      </button>
    </div>
  )
}

/* ───────── Auswahlfrage ───────── */
export function ChoiceView({ q, onAnswer, answered }: { q: ChoiceQuestion; onAnswer: (correct: boolean, ms: number) => void; answered: boolean }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const t0 = useRef(performance.now())
  useEffect(() => {
    setChosen(null)
    t0.current = performance.now()
  }, [q])

  const choose = (o: string) => {
    if (answered || chosen) return
    setChosen(o)
    const ok = o === q.answer
    if (ok) {
      sfx.correct()
      buzz.ok()
    } else {
      sfx.wrong()
      buzz.bad()
    }
    if (q.type === 'reading' && q.example && useStore.getState().settings.sound && hasJapaneseVoice()) speak(q.example.r)
    onAnswer(ok, performance.now() - t0.current)
  }

  const cls = (o: string) => {
    if (!chosen) return ''
    if (o === q.answer) return 'correct'
    if (o === chosen) return 'wrong'
    return 'dim'
  }

  return (
    <div className="question fade-up" key={q.char + q.type}>
      {q.type === 'meaning' && (
        <>
          <p className="q-label">Was bedeutet dieses Kanji?</p>
          <div className="q-kanji">
            <KanjiStrokes char={q.char} strokeWidth={4.6} />
          </div>
        </>
      )}
      {q.type === 'kanji' && (
        <>
          <p className="q-label">Welches Kanji bedeutet …</p>
          <div className="q-meaning">„{meaningLabel(q.char)}“</div>
        </>
      )}
      {q.type === 'reading' && q.example && (
        <>
          <p className="q-label">Wie liest man dieses Wort?</p>
          <div className="q-word jp">
            {[...q.example.w].map((ch, i) => (
              <span key={i} className={ch === q.char ? 'hl' : ''}>
                {ch}
              </span>
            ))}
          </div>
          <div className="q-sub muted">„{q.example.m}“</div>
        </>
      )}
      <div className={`choices two ${q.type === 'kanji' ? 'kanji-grid' : ''}`}>
        {q.options.map((o) => (
          <button key={o} className={`choice ${q.type === 'kanji' ? 'kanji-choice' : ''} ${q.type === 'reading' ? 'kana-choice' : ''} ${cls(o)}`} onClick={() => choose(o)} disabled={answered}>
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
  )
}

/* ───────── Schreibaufgabe ───────── */
const MO_LINES: Record<StrokeVerdict, string[]> = {
  ok: ['Schön!', 'Sauber!', 'Genau so!', 'Weiter so!', 'Wie ein Profi!'],
  reversed: ['Andersherum! Starte am anderen Ende.', 'Fast – nur die Richtung stimmt nicht.'],
  order: ['Gut erkannt, aber dieser Strich kommt später.', 'Reihenfolge! Zuerst ein anderer Strich.'],
  miss: ['Fast! Versuch’s noch einmal.', 'Nicht ganz – achte auf Lage und Form.', 'Probier’s nochmal, du schaffst das!'],
}

export function useMoReaction(initial: string) {
  const [state, setState] = useState<{ mood: MoMood; text: string }>({ mood: 'idle', text: initial })
  const react = (v: StrokeVerdict) => setState({ mood: v === 'ok' ? 'happy' : v === 'miss' ? 'think' : 'surprised', text: pick(MO_LINES[v]) })
  return [state, react, setState] as const
}

export function WriteView({
  char,
  mode,
  onDone,
  allowGiveUp = true,
  prompt,
}: {
  char: string
  mode: 'trace' | 'free'
  onDone: (r: WriteResult & { gaveUp: boolean }) => void
  allowGiveUp?: boolean
  prompt?: ReactNode
}) {
  const k = KANJI_MAP[char]
  const showNumbers = useStore((s) => s.settings.strokeNumbers)
  const [hintKey, setHintKey] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mo, react] = useMoReaction(
    mode === 'trace' ? 'Fahre die Striche nach – beim roten Punkt geht’s los.' : `${strokeCount(char)} ${strokeCount(char) === 1 ? 'Strich' : 'Striche'}. Du schaffst das!`,
  )
  const [replay, setReplay] = useState(0)

  return (
    <div className="question write-q fade-up" key={char + mode}>
      {prompt ?? (
        <>
          <p className="q-label">{mode === 'trace' ? 'Spure das Kanji nach' : 'Schreibe das Kanji für …'}</p>
          <div className="q-meaning small-q">„{meaningLabel(char)}“</div>
        </>
      )}
      <div className="row mo-line">
        <Mo mood={mo.mood} size={44} />
        <span className="mo-line-text" key={mo.text}>
          {gaveUp ? 'So geht es! Schau genau hin.' : mo.text}
        </span>
      </div>
      <div className="pad-wrap">
        {gaveUp ? (
          <div className="grid-paper">
            <KanjiStrokes char={char} animate withDrop showNumbers playKey={replay} speed={0.9} />
          </div>
        ) : (
          <WritingPad char={char} mode={mode} hintKey={hintKey} showNumbers={showNumbers} onFeedback={react} onComplete={(r) => {
              setFinished(true)
              onDone({ ...r, gaveUp: false })
            }}
          />
        )}
      </div>
      <div className="row write-tools" style={finished ? { visibility: 'hidden' } : undefined}>
        {gaveUp ? (
          <>
            <button className="link-btn" onClick={() => setReplay((n) => n + 1)}>
              <IconReplay width={18} height={18} style={{ verticalAlign: '-4px' }} /> Nochmal zeigen
            </button>
            <div className="spacer" />
            <button className="btn small-btn red" onClick={() => {
                setFinished(true)
                onDone({ mistakes: 99, hints: 1, ms: 0, gaveUp: true })
              }}>
              Weiter
            </button>
          </>
        ) : (
          <>
            {mode === 'free' && (
              <button
                className="link-btn"
                onClick={() => {
                  sfx.tap()
                  setHintKey((n) => n + 1)
                }}
              >
                <IconBulb width={18} height={18} style={{ verticalAlign: '-4px' }} /> Tipp
              </button>
            )}
            <div className="spacer" />
            {allowGiveUp && mode === 'free' && (
              <button
                className="link-btn muted-link"
                onClick={() => {
                  sfx.wrong()
                  setGaveUp(true)
                }}
              >
                Weiß ich nicht
              </button>
            )}
            {mode === 'trace' && k.on[0] && <SpeakButton text={(k.kun[0] ?? k.on[0]).replace('.', '')} small />}
          </>
        )}
      </div>
    </div>
  )
}
