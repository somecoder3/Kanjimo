import { useSyncExternalStore } from 'react'

/** Schlanker Hash-Router mit Abbruch-Schutz für laufende Sitzungen. */
type Guard = (target: string) => boolean

let guard: Guard | null = null
let current = readHash()
const listeners = new Set<() => void>()

function readHash(): string {
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ''))
  return h.startsWith('/') ? h : '/'
}

window.addEventListener('hashchange', () => {
  const target = readHash()
  if (target === current) return
  if (guard && !guard(target)) {
    // Navigation (z. B. Zurück-Taste) abfangen und Adresse wiederherstellen
    history.pushState(null, '', '#' + encodeURI(current))
    return
  }
  current = target
  window.scrollTo(0, 0)
  listeners.forEach((l) => l())
})

export function navigate(path: string, opts: { replace?: boolean; force?: boolean } = {}) {
  if (path === current) return
  if (!opts.force && guard && !guard(path)) return
  const prevGuard = guard
  if (opts.force) guard = null
  current = path
  if (opts.replace) history.replaceState(null, '', '#' + encodeURI(path))
  else history.pushState(null, '', '#' + encodeURI(path))
  if (opts.force) guard = prevGuard
  window.scrollTo(0, 0)
  listeners.forEach((l) => l())
}

export function back(fallback = '/') {
  if (history.length > 1) history.back()
  else navigate(fallback, { replace: true })
}

export function setLeaveGuard(g: Guard | null) {
  guard = g
}

export function useRoute(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
