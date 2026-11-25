import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useRoute } from './lib/router'
import { useStore } from './lib/store'
import { onEvent } from './lib/events'
import { buzz, sfx } from './lib/feedback'
import { ACHIEVEMENT_MAP } from './data/achievements'
import { Confetti } from './components/ui'
import { TabBar } from './components/TabBar'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { PathScreen } from './screens/Path'
import { Lesson } from './screens/Lesson'
import { Review } from './screens/Review'
import { Collection } from './screens/Collection'
import { KanjiDetail } from './screens/KanjiDetail'
import { Profile } from './screens/Profile'
import { Settings } from './screens/Settings'
import { About } from './screens/About'
import { GamesHub } from './screens/GamesHub'
import { Blitz } from './screens/games/Blitz'
import { Pairs } from './screens/games/Pairs'
import { InkRain } from './screens/games/InkRain'
import { WritePractice } from './screens/WritePractice'

interface Toast {
  id: number
  icon: string
  title: string
  text?: string
  out?: boolean
}

let toastId = 0

function useTheme() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'auto' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#15172a' : '#fbf6ee'))
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

export function App() {
  useTheme()
  const route = useRoute()
  const onboarded = useStore((s) => s.onboarded)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confetti, setConfetti] = useState(0)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const push = (t: Omit<Toast, 'id'>, ms = 3400) => {
      const id = ++toastId
      setToasts((ts) => [...ts.slice(-2), { ...t, id }])
      setTimeout(() => setToasts((ts) => ts.map((x) => (x.id === id ? { ...x, out: true } : x))), ms)
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), ms + 320)
    }
    return onEvent((e) => {
      switch (e.type) {
        case 'achievement': {
          const a = ACHIEVEMENT_MAP[e.id]
          if (!a) return
          sfx.fanfare()
          buzz.win()
          setConfetti((n) => n + 1)
          push({ icon: a.icon, title: 'Erfolg freigeschaltet!', text: a.title }, 4200)
          break
        }
        case 'goal':
          sfx.fanfare()
          setConfetti((n) => n + 1)
          push({ icon: '🎯', title: 'Tagesziel erreicht!', text: 'Mo ist mächtig stolz auf dich.' }, 4000)
          break
        case 'level':
          sfx.fanfare()
          setConfetti((n) => n + 1)
          push({ icon: '🎖️', title: `Level ${e.level}!`, text: 'Du wirst immer besser.' }, 4000)
          break
        case 'streak':
          push(
            e.freezeUsed > 0
              ? { icon: '🧊', title: `Serienschutz eingesetzt`, text: `Deine Serie lebt weiter: ${e.days} Tage!` }
              : { icon: '🔥', title: `${e.days} Tage in Folge!`, text: 'Weiter so – deine Serie wächst.' },
          )
          break
        case 'toast':
          push({ icon: e.icon, title: e.text })
          break
      }
    })
  }, [])

  let screen: React.ReactNode
  let tabs = false
  const [, a, b] = route.split('/')

  if (!onboarded) {
    screen = <Onboarding />
  } else {
    switch (a) {
      case '':
      case undefined:
        screen = <Home />
        tabs = true
        break
      case 'pfad':
        screen = <PathScreen />
        tabs = true
        break
      case 'spiele':
        screen = <GamesHub />
        tabs = true
        break
      case 'sammlung':
        screen = <Collection />
        tabs = true
        break
      case 'profil':
        screen = <Profile />
        tabs = true
        break
      case 'einstellungen':
        screen = <Settings />
        break
      case 'ueber':
        screen = <About />
        break
      case 'lektion':
        screen = <Lesson key={route} unitId={Number(b)} />
        break
      case 'wiederholen':
        screen = <Review key={route} practice={b === 'ueben'} />
        break
      case 'kanji':
        screen = <KanjiDetail key={route} char={b ?? ''} />
        break
      case 'schreiben':
        screen = <WritePractice key={route} char={b} />
        break
      case 'spiel':
        screen = b === 'blitz' ? <Blitz key={route} /> : b === 'paare' ? <Pairs key={route} /> : b === 'regen' ? <InkRain key={route} /> : <GamesHub />
        tabs = !['blitz', 'paare', 'regen'].includes(b ?? '')
        break
      default:
        screen = <Home />
        tabs = true
    }
  }

  return (
    <div className="app">
      {screen}
      {tabs && <TabBar route={route} />}
      <div className="toast-wrap" aria-live="polite">
        {needRefresh && (
          <div className="toast">
            <span className="t-icon">✨</span>
            <div style={{ flex: 1 }}>
              <div>Neue Version verfügbar</div>
            </div>
            <button className="btn small-btn" style={{ marginBottom: 0 }} onClick={() => updateServiceWorker(true)}>
              Aktualisieren
            </button>
          </div>
        )}
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.out ? 'out' : ''}`}>
            <span className="t-icon">{t.icon}</span>
            <div>
              <div>{t.title}</div>
              {t.text && <div className="small muted" style={{ fontWeight: 600 }}>{t.text}</div>}
            </div>
          </div>
        ))}
      </div>
      <Confetti fire={confetti} />
    </div>
  )
}
