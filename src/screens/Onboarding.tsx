import { useState } from 'react'
import { Mo, type MoMood } from '../components/Mo'
import { KanjiStrokes } from '../components/KanjiStrokes'
import { WritingPad } from '../components/WritingPad'
import { GOALS } from '../lib/gamification'
import { useStore } from '../lib/store'
import { GRADE } from '../lib/srs'
import { sfx, buzz } from '../lib/feedback'
import { Confetti } from '../components/ui'

type Step = 'hello' | 'name' | 'goal' | 'demo' | 'write' | 'done'

export function Onboarding() {
  const [step, setStep] = useState<Step>('hello')
  const [goal, setGoal] = useState(40)
  const [mood, setMood] = useState<MoMood>('happy')
  const [demoDone, setDemoDone] = useState(false)
  const [fire, setFire] = useState(0)
  const complete = useStore((s) => s.completeOnboarding)
  const learnKanji = useStore((s) => s.learnKanji)
  const addXp = useStore((s) => s.addXp)

  const go = (s: Step) => {
    sfx.tap()
    setStep(s)
  }

  const dots: Step[] = ['hello', 'name', 'goal', 'demo', 'write']
  return (
    <main className="screen full onboarding">
      {step !== 'done' && (
        <div className="ob-dots" aria-hidden="true">
          {dots.map((d) => (
            <span key={d} className={dots.indexOf(d) <= dots.indexOf(step) ? 'on' : ''} />
          ))}
        </div>
      )}

      {step === 'hello' && (
        <section className="ob-step" key="hello">
          <div className="ob-hero">
            <div className="bubble down fade-up" style={{ animationDelay: '.3s' }}>
              Hallo! Ich bin <b>Mo</b>, ein kleiner Tintentropfen. 💧
            </div>
            <Mo mood="happy" size={170} wave />
          </div>
          <h1 className="ob-logo">
            Kanji<span>mo</span>
          </h1>
          <p className="muted center">Lerne Kanji mit Spaß – Strich für Strich, ein bisschen jeden Tag.</p>
          <div className="spacer" />
          <button className="btn block" onClick={() => go('name')}>
            Los geht’s!
          </button>
        </section>
      )}

      {step === 'name' && (
        <section className="ob-step" key="name">
          <div className="ob-hero">
            <Mo mood="think" size={120} />
          </div>
          <h2 className="title center">Was bedeutet „Kanjimo“?</h2>
          <div className="ob-word fade-up">
            <div className="ob-part">
              <span className="jp">漢字</span>
              <b>Kanji</b>
              <small>chinesische Schriftzeichen</small>
            </div>
            <span className="ob-plus">+</span>
            <div className="ob-part">
              <span className="jp">文字</span>
              <b>Moji</b>
              <small>Schriftzeichen</small>
            </div>
          </div>
          <p className="muted center">Und „Mo“ – das bin ich! Ich verwandle mich in Pinselstriche und zeige dir jedes Zeichen.</p>
          <div className="spacer" />
          <button className="btn block" onClick={() => go('goal')}>
            Verstanden
          </button>
        </section>
      )}

      {step === 'goal' && (
        <section className="ob-step" key="goal">
          <div className="row" style={{ gap: 14 }}>
            <Mo mood="idle" size={72} />
            <div className="bubble left" style={{ flex: 1 }}>
              Wie viel möchtest du täglich üben? Kleine Schritte wirken Wunder!
            </div>
          </div>
          <div className="stack" style={{ marginTop: 18 }}>
            {GOALS.map((g) => (
              <button
                key={g.xp}
                className={`goal-opt ${goal === g.xp ? 'on' : ''}`}
                onClick={() => {
                  sfx.tap()
                  buzz.light()
                  setGoal(g.xp)
                }}
                aria-pressed={goal === g.xp}
              >
                <span className="goal-emoji">{g.emoji}</span>
                <span style={{ flex: 1 }}>
                  <b>{g.label}</b>
                  <span className="small muted" style={{ display: 'block' }}>
                    {g.hint}
                  </span>
                </span>
                <span className="pill">{g.xp} XP</span>
              </button>
            ))}
          </div>
          <p className="small faint center" style={{ marginTop: 10 }}>
            Du kannst das jederzeit in den Einstellungen ändern.
          </p>
          <div className="spacer" />
          <button className="btn block" onClick={() => go('demo')}>
            Weiter
          </button>
        </section>
      )}

      {step === 'demo' && (
        <section className="ob-step" key="demo">
          <div className="bubble down center fade-up">Zusammen schreiben wir dein erstes Kanji. Schau mir zu!</div>
          <div className="ob-demo">
            <div className={`ob-mo-dive ${demoDone ? 'back' : ''}`}>
              <Mo mood={demoDone ? 'cheer' : 'happy'} size={86} />
            </div>
            <div className="grid-paper" style={{ width: 'min(70vw, 280px)' }}>
              <KanjiStrokes char="一" animate withDrop playKey={1} speed={0.55} onDone={() => setDemoDone(true)} />
            </div>
          </div>
          {demoDone && (
            <div className="center fade-up">
              <div className="title">„eins“</div>
              <p className="muted">Ein einziger Strich – von links nach rechts.</p>
            </div>
          )}
          <div className="spacer" />
          <button className="btn block" disabled={!demoDone} onClick={() => go('write')}>
            Jetzt bin ich dran!
          </button>
        </section>
      )}

      {step === 'write' && (
        <section className="ob-step" key="write">
          <div className="row" style={{ gap: 12 }}>
            <Mo mood={mood} size={64} />
            <div className="bubble left" style={{ flex: 1 }}>
              {mood === 'sad' ? 'Fast! Fang beim roten Punkt an und zieh nach rechts.' : 'Fahre mit dem Finger über den Strich – von links nach rechts.'}
            </div>
          </div>
          <div style={{ width: 'min(86vw, 340px)', margin: '20px auto 0' }}>
            <WritingPad
              char="一"
              mode="trace"
              onFeedback={(v) => setMood(v === 'ok' ? 'cheer' : 'sad')}
              onComplete={() => {
                sfx.complete()
                buzz.win()
                setFire((f) => f + 1)
                setStep('done')
              }}
            />
          </div>
        </section>
      )}

      {step === 'done' && (
        <section className="ob-step" key="done">
          <div className="ob-hero">
            <div className="bubble down pop-in">Wunderbar! Dein erstes Kanji! 🎉</div>
            <Mo mood="cheer" size={150} />
          </div>
          <div className="center">
            <div className="jp ob-big">一</div>
            <p className="muted">Ab jetzt lernen wir jeden Tag ein bisschen. Ich erinnere dich genau dann an ein Kanji, wenn du es fast vergessen hättest – so bleibt es für immer.</p>
          </div>
          <div className="spacer" />
          <button
            className="btn green block"
            onClick={() => {
              complete(goal)
              learnKanji([{ char: '一', grade: GRADE.good }])
              addXp(5)
              sfx.complete()
            }}
          >
            Los geht’s!
          </button>
        </section>
      )}
      <Confetti fire={fire} />
    </main>
  )
}
