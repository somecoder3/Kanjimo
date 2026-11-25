import { useStore } from '../lib/store'
import { navigate } from '../lib/router'
import { addDays, dayKey, diffDays, parseDay } from '../lib/date'
import { displayStreak, levelInfo, MAX_FREEZES } from '../lib/gamification'
import { mastery } from '../lib/srs'
import { ACHIEVEMENTS } from '../data/achievements'
import { KANJI_ORDER, LEVELS, levelOf } from '../data/kanji'
import { Mo } from '../components/Mo'
import { IconFlame, IconGear, IconSnow } from '../components/Icons'

const WEEKS = 14

export function Profile() {
  const s = useStore()
  const today = dayKey()
  const lv = levelInfo(s.stats.xp)
  const streak = displayStreak(s.stats, today)
  const learned = Object.keys(s.progress).length
  const masteredN = Object.values(s.progress).filter((p) => mastery(p.card) >= 3).length
  const acc = s.stats.reviews ? Math.round((s.stats.correct / s.stats.reviews) * 100) : null
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length
  const memberDays = Math.max(1, diffDays(dayKey(new Date(s.createdAt)), today) + 1)

  // Heatmap: Spalten = Wochen (Mo–So), letzte Spalte = aktuelle Woche
  const todayDow = (parseDay(today).getDay() + 6) % 7
  const start = addDays(today, -(WEEKS - 1) * 7 - todayDow)
  const cols = Array.from({ length: WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))
  const goal = s.settings.dailyGoal
  const level = (xp: number) => (xp <= 0 ? 0 : xp < goal * 0.5 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4)

  return (
    <main className="screen profile">
      <header className="row" style={{ marginBottom: 6 }}>
        <div className="title" style={{ flex: 1 }}>
          Profil
        </div>
        <button className="icon-btn" onClick={() => navigate('/einstellungen')} aria-label="Einstellungen">
          <IconGear />
        </button>
      </header>

      <section className="card profile-hero">
        <div className="profile-mo">
          <Mo mood={streak.activeToday ? 'love' : 'happy'} size={86} />
          <span className="lvl-badge big">{lv.level}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="bold">Level {lv.level}</div>
          <div className="small muted">
            {s.stats.xp} XP gesamt · seit {memberDays} {memberDays === 1 ? 'Tag' : 'Tagen'} dabei
          </div>
          <div className="progress" style={{ marginTop: 8, height: 10 }}>
            <div style={{ width: `${lv.progress * 100}%`, background: 'var(--primary)' }} />
          </div>
          <div className="tiny muted" style={{ marginTop: 4 }}>
            Noch {lv.needed - lv.into} XP bis Level {lv.level + 1}
          </div>
        </div>
      </section>

      <div className="stat-grid">
        <div className="card stat">
          <span className="stat-icon" style={{ color: 'var(--hanko)' }}>
            <IconFlame />
          </span>
          <b>{streak.days}</b>
          <span className="tiny muted">Tage Serie</span>
        </div>
        <div className="card stat">
          <span className="stat-icon">🏆</span>
          <b>{s.stats.bestStreak}</b>
          <span className="tiny muted">Beste Serie</span>
        </div>
        <div className="card stat">
          <span className="stat-icon" style={{ color: 'var(--sky)' }}>
            <IconSnow />
          </span>
          <b>
            {s.stats.freezes}/{MAX_FREEZES}
          </b>
          <span className="tiny muted">Serienschutz</span>
        </div>
        <div className="card stat">
          <span className="stat-icon jp" style={{ fontSize: '1.3rem' }}>
            字
          </span>
          <b>
            {learned}/{KANJI_ORDER.length}
          </b>
          <span className="tiny muted">Kanji gelernt</span>
        </div>
        <div className="card stat">
          <span className="stat-icon">🌸</span>
          <b>{masteredN}</b>
          <span className="tiny muted">Sicher gefestigt</span>
        </div>
        <div className="card stat">
          <span className="stat-icon">🎯</span>
          <b>{acc === null ? '–' : `${acc}%`}</b>
          <span className="tiny muted">Trefferquote</span>
        </div>
      </div>
      <p className="tiny faint" style={{ margin: '6px 4px 0' }}>
        🧊 Serienschutz: Für jede 7 Tage Serie bekommst du einen (max. {MAX_FREEZES}). Er rettet deine Serie automatisch, wenn du mal einen Tag aussetzt.
      </p>

      <h2 className="section-title">JLPT-Stufen</h2>
      <div className="card stack">
        {LEVELS.map((l) => {
          const list = KANJI_ORDER.filter((c) => levelOf(c) === l)
          const got = list.filter((c) => s.progress[c]).length
          return (
            <div key={l} className="row small" style={{ gap: 12 }}>
              <b style={{ width: 28 }}>N{l}</b>
              <div className="progress" style={{ height: 10 }}>
                <div style={{ width: `${list.length ? (got / list.length) * 100 : 0}%` }} />
              </div>
              <span className="muted" style={{ width: 78, textAlign: 'right' }}>
                {got}/{list.length}
              </span>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">Aktivität</h2>
      <div className="card heat-card">
        <div className="heatmap" role="img" aria-label="Lernaktivität der letzten Wochen">
          <div className="heat-days tiny faint">
            <span>Mo</span>
            <span />
            <span>Mi</span>
            <span />
            <span>Fr</span>
            <span />
            <span>So</span>
          </div>
          {cols.map((col, ci) => (
            <div key={ci} className="heat-col">
              {col.map((d) => {
                const future = diffDays(today, d) > 0
                const xp = s.stats.days[d]?.xp ?? 0
                const frozen = s.stats.frozenDays.includes(d)
                return <span key={d} className={`heat h${future ? 'x' : frozen && !xp ? 'f' : level(xp)} ${d === today ? 'today' : ''}`} title={`${d}: ${xp} XP`} />
              })}
            </div>
          ))}
        </div>
        <div className="heat-legend tiny muted">
          weniger <span className="heat h1" />
          <span className="heat h2" />
          <span className="heat h3" />
          <span className="heat h4" /> mehr · <span className="heat hf" /> Serienschutz
        </div>
      </div>

      <h2 className="section-title">
        Erfolge · {unlocked}/{ACHIEVEMENTS.length}
      </h2>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = !!s.achievements[a.id]
          return (
            <div key={a.id} className={`ach ${got ? 'got' : ''}`} title={a.desc}>
              <span className="ach-icon">{got ? a.icon : '🔒'}</span>
              <b className="small">{a.title}</b>
              <span className="tiny muted">{a.desc}</span>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">Bisher</h2>
      <div className="card stack small">
        <div className="row">
          <span style={{ flex: 1 }}>Lektionen abgeschlossen</span>
          <b>{s.stats.lessons}</b>
        </div>
        <div className="row">
          <span style={{ flex: 1 }}>Wiederholungen</span>
          <b>{s.stats.reviews}</b>
        </div>
        <div className="row">
          <span style={{ flex: 1 }}>Kanji geschrieben</span>
          <b>{s.stats.writes}</b>
        </div>
        <div className="row">
          <span style={{ flex: 1 }}>Beste Combo</span>
          <b>{s.stats.bestCombo}</b>
        </div>
        <div className="row">
          <span style={{ flex: 1 }}>Tagesziel erreicht</span>
          <b>{s.stats.goalsMet}×</b>
        </div>
      </div>
    </main>
  )
}
