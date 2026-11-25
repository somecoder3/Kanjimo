import { addDays, diffDays } from './date'

export const XP = {
  lessonPerKanji: 5,
  lessonBonus: 10,
  lessonPerfect: 5,
  reviewCorrect: 2,
  reviewWrite: 1,
  comboBonus: 1,
  practiceWrite: 3,
} as const

export const GOALS = [
  { xp: 20, label: 'Locker', hint: 'ca. 5 Min. am Tag', emoji: '🌱' },
  { xp: 40, label: 'Normal', hint: 'ca. 10 Min. am Tag', emoji: '🌿' },
  { xp: 70, label: 'Ehrgeizig', hint: 'ca. 15 Min. am Tag', emoji: '🌳' },
  { xp: 100, label: 'Intensiv', hint: 'ca. 20 Min. am Tag', emoji: '🔥' },
] as const

/** Gesamt-XP, die für das Erreichen von Level n nötig sind. */
export function xpForLevel(n: number): number {
  return 25 * n * (n - 1)
}

export function levelInfo(xp: number) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return { level, into: xp - base, needed: next - base, progress: (xp - base) / (next - base) }
}

export interface StreakState {
  streak: number
  bestStreak: number
  lastActiveDay: string | null
  freezes: number
  frozenDays: string[]
}

export const MAX_FREEZES = 2

/** Aktualisiert die Serie bei Aktivität am Tag `today`. */
export function touchStreak(st: StreakState, today: string): { next: StreakState; increased: boolean; freezeUsed: number } {
  if (st.lastActiveDay === today) return { next: st, increased: false, freezeUsed: 0 }
  let streak = 1
  let freezes = st.freezes
  let freezeUsed = 0
  const frozenDays = [...st.frozenDays]
  if (st.lastActiveDay) {
    const gap = diffDays(st.lastActiveDay, today)
    if (gap === 1) streak = st.streak + 1
    else if (gap > 1 && gap - 1 <= freezes && st.streak > 0) {
      freezeUsed = gap - 1
      freezes -= freezeUsed
      for (let i = 1; i < gap; i++) frozenDays.push(addDays(st.lastActiveDay, i))
      streak = st.streak + 1
    } else if (gap < 0) {
      // Uhr zurückgestellt – Serie nicht zerstören
      return { next: st, increased: false, freezeUsed: 0 }
    }
  }
  if (streak > 0 && streak % 7 === 0) freezes = Math.min(MAX_FREEZES, freezes + 1)
  return {
    next: {
      streak,
      bestStreak: Math.max(st.bestStreak, streak),
      lastActiveDay: today,
      freezes,
      frozenDays: frozenDays.slice(-60),
    },
    increased: true,
    freezeUsed,
  }
}

/** Serie, wie sie heute angezeigt wird (0, falls sie gerissen ist). */
export function displayStreak(st: StreakState, today: string): { days: number; activeToday: boolean; atRisk: boolean } {
  if (!st.lastActiveDay) return { days: 0, activeToday: false, atRisk: false }
  const gap = diffDays(st.lastActiveDay, today)
  if (gap <= 0) return { days: st.streak, activeToday: true, atRisk: false }
  if (gap === 1) return { days: st.streak, activeToday: false, atRisk: true }
  if (gap - 1 <= st.freezes) return { days: st.streak, activeToday: false, atRisk: true }
  return { days: 0, activeToday: false, atRisk: false }
}
