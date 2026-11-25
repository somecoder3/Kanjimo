import { KANJI_ORDER } from '../data/kanji'
import { useStore, type KanjiProgress } from '../lib/store'
import { navigate } from '../lib/router'
import { Mo } from '../components/Mo'
import { IconTrophy } from '../components/Icons'
import { sfx } from '../lib/feedback'

export const MIN_POOL = 6

/** Kanji für Spiele: gelernte, sonst Anfänger-Set. */
export function gamePool(progress: Record<string, KanjiProgress>): { pool: string[]; beginner: boolean } {
  const learned = Object.keys(progress)
  if (learned.length >= MIN_POOL) return { pool: learned, beginner: false }
  return { pool: [...new Set([...learned, ...KANJI_ORDER.slice(0, 12)])], beginner: true }
}

const GAMES = [
  {
    id: 'blitz',
    title: 'Blitzrunde',
    desc: '60 Sekunden, so viele Kanji wie möglich. Combos geben Extrapunkte!',
    emoji: '⚡',
    color: 'var(--gold-soft)',
    skill: 'Schnelles Erkennen',
  },
  {
    id: 'paare',
    title: 'Paare finden',
    desc: 'Finde Kanji und Bedeutung, die zusammengehören. Trainiert dein Gedächtnis.',
    emoji: '🃏',
    color: 'var(--sakura-soft)',
    skill: 'Gedächtnis',
  },
  {
    id: 'regen',
    title: 'Tintenregen',
    desc: 'Kanji-Tropfen fallen vom Himmel. Fang sie mit der richtigen Bedeutung, bevor sie landen!',
    emoji: '☔',
    color: 'var(--primary-soft)',
    skill: 'Reaktion',
  },
]

export function GamesHub() {
  const progress = useStore((s) => s.progress)
  const highscores = useStore((s) => s.stats.highscores)
  const { beginner } = gamePool(progress)
  return (
    <main className="screen games">
      <header className="row" style={{ marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div className="title">Spiele</div>
          <div className="small muted">Spielend wiederholen – ganz ohne Druck.</div>
        </div>
        <Mo mood="wink" size={58} />
      </header>
      {beginner && (
        <div className="card small" style={{ marginBottom: 12, background: 'var(--gold-soft)', borderColor: 'transparent' }}>
          🌱 Du spielst mit Anfänger-Kanji. Sobald du {MIN_POOL} Kanji gelernt hast, nutzen die Spiele deine eigenen.
        </div>
      )}
      <div className="stack">
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            className="card tap game-card fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => {
              sfx.tap()
              navigate(`/spiel/${g.id}`)
            }}
          >
            <span className="game-emoji" style={{ background: g.color }}>
              {g.emoji}
            </span>
            <span style={{ flex: 1 }}>
              <span className="row" style={{ gap: 8 }}>
                <b>{g.title}</b>
                <span className="pill tiny">{g.skill}</span>
              </span>
              <span className="small muted" style={{ display: 'block', marginTop: 2 }}>
                {g.desc}
              </span>
              {(highscores[g.id === 'paare' ? 'pairs' : g.id === 'regen' ? 'rain' : 'blitz'] ?? 0) > 0 && (
                <span className="small bold" style={{ color: 'var(--gold-press)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <IconTrophy width={16} height={16} /> Rekord: {highscores[g.id === 'paare' ? 'pairs' : g.id === 'regen' ? 'rain' : 'blitz']}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
