import { IconGame, IconGrid, IconHome, IconPath, IconUser } from './Icons'
import { navigate } from '../lib/router'
import { dueChars, useStore } from '../lib/store'
import { sfx, buzz } from '../lib/feedback'

const TABS = [
  { path: '/', label: 'Heute', Icon: IconHome },
  { path: '/pfad', label: 'Lernpfad', Icon: IconPath },
  { path: '/spiele', label: 'Spiele', Icon: IconGame },
  { path: '/sammlung', label: 'Sammlung', Icon: IconGrid },
  { path: '/profil', label: 'Profil', Icon: IconUser },
]

export function TabBar({ route }: { route: string }) {
  const progress = useStore((s) => s.progress)
  const due = dueChars(progress).length
  const base = '/' + (route.split('/')[1] ?? '')
  return (
    <nav className="tabbar" aria-label="Hauptnavigation">
      {TABS.map(({ path, label, Icon }) => {
        const active = path === '/' ? base === '/' : base === path || (path === '/spiele' && base === '/spiel')
        return (
          <button
            key={path}
            className={`tab ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              if (!active) {
                sfx.tap()
                buzz.light()
              }
              navigate(path)
            }}
          >
            <Icon />
            <span>{label}</span>
            {path === '/' && due > 0 && <span className="badge">{due > 99 ? '99+' : due}</span>}
          </button>
        )
      })}
    </nav>
  )
}
