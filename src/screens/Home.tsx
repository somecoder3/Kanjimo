import { useMemo } from 'react'
import { Mo, type MoMood } from '../components/Mo'
import { Ring } from '../components/ui'
import { IconBolt, IconChevron, IconFlame, IconGear, IconMoon, IconPencil, IconPlay, IconSnow, IconSun } from '../components/Icons'
import { KanjiStrokes } from '../components/KanjiStrokes'
import { navigate } from '../lib/router'
import { dueChars, todayStats, useStore } from '../lib/store'
import { addDays, dayKey, formatRelative, timeOfDay, weekdayShort } from '../lib/date'
import { displayStreak, levelInfo } from '../lib/gamification'
import { UNITS, unitLabel } from '../data/kanji'
import { sfx } from '../lib/feedback'
import { pick } from '../lib/random'

const GREETING = { morning: 'Guten Morgen!', day: 'Hallo!', evening: 'Guten Abend!', night: 'Noch wach?' }

const CHEERS = [
  'Jeder Pinselstrich bringt dich weiter.',
  'Ein Kanji am Tag hält das Vergessen fern!',
  'Ich hab schon Tinte für dich angerührt.',
  'Kleine Schritte, große Wirkung – auf geht’s!',
  'Dein Gehirn liebt kurze, regelmäßige Lerneinheiten.',
]

export function Home() {
  const s = useStore()
  const today = dayKey()
  const due = dueChars(s.progress)
  const ts = todayStats(s.stats)
  const goal = s.settings.dailyGoal
  const goalProgress = ts.xp / goal
  const streak = displayStreak(s.stats, today)
  const learnedCount = Object.keys(s.progress).length
  const nextUnit = UNITS.find((u) => !s.units[u.id])
  const lv = levelInfo(s.stats.xp)
  const tod = timeOfDay()

  const nextDue = useMemo(() => {
    const times = Object.values(s.progress).map((p) => new Date(p.card.dueAt).getTime())
    const future = times.filter((t) => t > Date.now())
    return future.length ? new Date(Math.min(...future)) : null
  }, [s.progress])

  const { msg, mood } = useMemo((): { msg: string; mood: MoMood } => {
    if (learnedCount <= 1 && !s.units[1]) return { msg: 'Bereit für deine erste Lektion? Ich zeige dir jeden Strich!', mood: 'happy' }
    if (ts.xp >= goal) return { msg: 'Tagesziel geschafft! Ich bin so stolz auf dich! 🎉', mood: 'love' }
    if (due.length >= 10) return { msg: `${due.length} Kanji vermissen dich schon! Eine kurze Runde?`, mood: 'surprised' }
    if (streak.atRisk && streak.days > 1 && (tod === 'evening' || tod === 'night'))
      return { msg: `Deine ${streak.days}-Tage-Serie wartet auf dich – nur eine kleine Runde!`, mood: 'think' }
    if (due.length > 0) return { msg: `${due.length} ${due.length === 1 ? 'Kanji ist' : 'Kanji sind'} bereit zur Wiederholung.`, mood: 'happy' }
    if (tod === 'night') return { msg: 'Psst … ein kleines Kanji vor dem Schlafen? Das merkt sich besonders gut.', mood: 'sleep' }
    if (tod === 'morning') return { msg: 'Frischer Kopf, frische Kanji! ☀️', mood: 'happy' }
    return { msg: pick(CHEERS), mood: 'idle' }
  }, [learnedCount, ts.xp >= goal, due.length, streak.days, tod])

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  return (
    <main className="screen home">
      <header className="row home-head">
        <div style={{ flex: 1 }}>
          <div className="title">{GREETING[tod]}</div>
          <div className="small muted">Level {lv.level} · {learnedCount} Kanji gelernt</div>
        </div>
        <button className={`streak-pill ${streak.activeToday ? 'on' : ''}`} onClick={() => navigate('/profil')} aria-label={`Serie: ${streak.days} Tage`}>
          <IconFlame />
          <b>{streak.days}</b>
          {s.stats.freezes > 0 && (
            <span className="freeze" title="Serienschutz">
              <IconSnow />
              {s.stats.freezes}
            </span>
          )}
        </button>
        <ThemeToggle />
        <button className="icon-btn" onClick={() => navigate('/einstellungen')} aria-label="Einstellungen">
          <IconGear />
        </button>
      </header>

      <section className="mo-card">
        <div className="mo-card-mo">
          <Mo mood={mood} size={92} />
        </div>
        <div className="bubble left mo-card-bubble" key={msg}>
          {msg}
        </div>
      </section>

      <section className="card goal-card">
        <Ring value={goalProgress} size={76} stroke={9} color={goalProgress >= 1 ? 'var(--gold)' : 'var(--matcha)'}>
          <span className="ring-num">{goalProgress >= 1 ? '✓' : `${Math.round(Math.min(1, goalProgress) * 100)}%`}</span>
        </Ring>
        <div style={{ flex: 1 }}>
          <div className="bold">Tagesziel</div>
          <div className="small muted">
            {ts.xp >= goal ? `Geschafft! ${ts.xp} XP heute.` : `${ts.xp} von ${goal} XP · noch ${goal - ts.xp} XP`}
          </div>
          <div className="week">
            {week.map((d) => {
              const xp = s.stats.days[d]?.xp ?? 0
              const frozen = s.stats.frozenDays.includes(d)
              return (
                <div key={d} className={`wday ${d === today ? 'today' : ''}`}>
                  <span className={`wdot ${xp >= goal ? 'full' : xp > 0 ? 'some' : frozen ? 'frozen' : ''}`}>
                    {xp >= goal ? '✓' : frozen ? '❄' : ''}
                  </span>
                  <span className="tiny">{weekdayShort(d)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {due.length > 0 && (
        <button
          className="card tap action-card review-card"
          onClick={() => {
            sfx.tap()
            navigate('/wiederholen')
          }}
        >
          <div className="ac-icon" style={{ background: 'var(--hanko-soft)', color: 'var(--hanko)' }}>
            <IconBolt />
          </div>
          <div style={{ flex: 1 }}>
            <div className="bold">Wiederholen</div>
            <div className="small muted">
              {due.length} {due.length === 1 ? 'Kanji wartet' : 'Kanji warten'} · ca. {Math.max(1, Math.round(Math.min(due.length, s.settings.reviewBatch) * 0.2))} Min.
            </div>
            <div className="due-preview jp">{due.slice(0, 8).join(' ')}</div>
          </div>
          <span className="play-dot red">
            <IconPlay />
          </span>
        </button>
      )}

      {nextUnit ? (
        <button
          className="card tap action-card lesson-card"
          onClick={() => {
            sfx.tap()
            navigate(`/lektion/${nextUnit.id}`)
          }}
        >
          <div className="lesson-kanji">
            <KanjiStrokes char={nextUnit.kanji[0]} strokeWidth={5} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="tiny bold faint" style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {due.length > 0 ? 'Danach' : 'Neue Lektion'} · {unitLabel(nextUnit).kicker}
            </div>
            <div className="bold">{unitLabel(nextUnit).name}</div>
            <div className="due-preview jp">{nextUnit.kanji.join(' ')}</div>
          </div>
          <span className="play-dot">
            <IconPlay />
          </span>
        </button>
      ) : (
        <div className="card center">
          <div style={{ fontSize: '2rem' }}>🏯</div>
          <div className="bold">Alle Einheiten abgeschlossen!</div>
          <p className="small muted">Wiederhole fleißig, damit alle Kanji „Gemeistert“ werden.</p>
        </div>
      )}

      {due.length === 0 && learnedCount > 1 && nextDue && (
        <p className="small muted center" style={{ margin: '4px 0 6px' }}>
          Nächste Wiederholung {formatRelative(nextDue)} · Mo passt auf dein Gedächtnis auf.
        </p>
      )}

      <div className="quick-row">
        <button className="card tap quick" onClick={() => navigate('/spiele')}>
          <span className="quick-emoji">🎮</span>
          <b>Spiele</b>
          <span className="tiny muted">Spielend festigen</span>
        </button>
        <button className="card tap quick" onClick={() => navigate('/schreiben')}>
          <span className="quick-emoji" style={{ color: 'var(--primary)' }}>
            <IconPencil width={30} height={30} />
          </span>
          <b>Schreiben</b>
          <span className="tiny muted">Freies Training</span>
        </button>
      </div>

      <button className="card tap row level-card" onClick={() => navigate('/profil')}>
        <span className="lvl-badge">{lv.level}</span>
        <div style={{ flex: 1 }}>
          <div className="row small" style={{ justifyContent: 'space-between' }}>
            <b>Level {lv.level}</b>
            <span className="muted">
              {lv.into} / {lv.needed} XP
            </span>
          </div>
          <div className="progress" style={{ marginTop: 6, height: 10 }}>
            <div style={{ width: `${lv.progress * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>
        <IconChevron width={20} height={20} style={{ color: 'var(--ink-faint)' }} />
      </button>
    </main>
  )
}

/** Schneller Wechsel zwischen hellem und dunklem Design. */
function ThemeToggle() {
  const update = useStore((st) => st.updateSettings)
  const theme = useStore((st) => st.settings.theme)
  const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  return (
    <button
      className="icon-btn theme-toggle"
      aria-label={dark ? 'Helles Design' : 'Dunkles Design'}
      onClick={() => {
        sfx.tap()
        update({ theme: dark ? 'light' : 'dark' })
      }}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  )
}
