/** Kleiner Ereignisbus für UI-Effekte (Toasts, Konfetti …). */
export type AppEvent =
  | { type: 'achievement'; id: string }
  | { type: 'goal' }
  | { type: 'level'; level: number }
  | { type: 'streak'; days: number; freezeUsed: number }
  | { type: 'toast'; icon: string; text: string }

type Listener = (e: AppEvent) => void
const listeners = new Set<Listener>()

export function emit(e: AppEvent) {
  listeners.forEach((l) => l(e))
}

export function onEvent(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
