import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { addDays, dayKey } from './date'
import { emit } from './events'
import { levelInfo, touchStreak, type StreakState } from './gamification'
import { newCard, review, type Grade, type StoredCard } from './srs'
import { ACHIEVEMENTS } from '../data/achievements'

export interface KanjiProgress {
  card: StoredCard
  learnedAt: string
  correct: number
  wrong: number
  writes: number
}

export type Theme = 'auto' | 'light' | 'dark'

export interface Settings {
  dailyGoal: number
  sound: boolean
  haptics: boolean
  theme: Theme
  strokeNumbers: boolean
  writingInReviews: boolean
  speechRate: number
  reviewBatch: number
}

export interface DayStats {
  xp: number
  reviews: number
  learned: number
}

export interface Stats extends StreakState {
  xp: number
  days: Record<string, DayStats>
  reviews: number
  correct: number
  wrong: number
  bestCombo: number
  perfectSessions: number
  lessons: number
  writes: number
  goalsMet: number
  highscores: Record<string, number>
  lateSessions: number
  earlySessions: number
  /** Zeitpunkt der letzten Sicherung (ISO) */
  lastBackup: string | null
  /** Tag, bis zu dem die Sicherungs-Erinnerung pausiert */
  backupSnoozeUntil: string | null
}

export interface PersistedState {
  version: 1
  onboarded: boolean
  createdAt: string
  settings: Settings
  stats: Stats
  progress: Record<string, KanjiProgress>
  units: Record<string, { done: string; stars: number }>
  achievements: Record<string, string>
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 40,
  sound: true,
  haptics: true,
  theme: 'auto',
  strokeNumbers: false,
  writingInReviews: true,
  speechRate: 0.85,
  reviewBatch: 20,
}

function defaultStats(): Stats {
  return {
    xp: 0,
    days: {},
    reviews: 0,
    correct: 0,
    wrong: 0,
    bestCombo: 0,
    perfectSessions: 0,
    lessons: 0,
    writes: 0,
    goalsMet: 0,
    highscores: {},
    lateSessions: 0,
    earlySessions: 0,
    lastBackup: null,
    backupSnoozeUntil: null,
    streak: 0,
    bestStreak: 0,
    lastActiveDay: null,
    freezes: 0,
    frozenDays: [],
  }
}

export function defaultState(): PersistedState {
  return {
    version: 1,
    onboarded: false,
    createdAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    stats: defaultStats(),
    progress: {},
    units: {},
    achievements: {},
  }
}

/** Führt geladene Daten robust mit den Standardwerten zusammen. */
export function normalizeState(raw: unknown): PersistedState {
  const d = defaultState()
  if (!raw || typeof raw !== 'object') return d
  const r = raw as Partial<PersistedState>
  return {
    version: 1,
    onboarded: !!r.onboarded,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : d.createdAt,
    settings: { ...d.settings, ...(r.settings ?? {}) },
    stats: { ...d.stats, ...(r.stats ?? {}), highscores: { ...(r.stats?.highscores ?? {}) }, days: { ...(r.stats?.days ?? {}) } },
    progress: r.progress && typeof r.progress === 'object' ? r.progress : {},
    units: r.units && typeof r.units === 'object' ? r.units : {},
    achievements: r.achievements && typeof r.achievements === 'object' ? r.achievements : {},
  }
}

export interface ReviewOutcome {
  char: string
  grade: Grade
  correct: boolean
  write?: boolean
}

interface Actions {
  completeOnboarding: (goal: number) => void
  updateSettings: (patch: Partial<Settings>) => void
  addXp: (amount: number) => void
  learnKanji: (results: { char: string; grade: Grade }[]) => void
  recordReview: (o: ReviewOutcome) => void
  finishSession: (info: { perfect: boolean; combo: number; count: number }) => void
  recordUnit: (unitId: number, stars: number) => void
  recordGame: (game: string, score: number) => boolean
  recordWrite: (char: string) => void
  resetAll: () => void
  importState: (raw: unknown) => void
  markBackup: () => void
  snoozeBackup: (days: number) => void
}

export type Store = PersistedState & Actions

const STORAGE_KEY = 'kanjimo-state-v1'

function today() {
  return dayKey()
}

function bumpDay(stats: Stats, patch: Partial<DayStats>): Record<string, DayStats> {
  const k = today()
  const cur = stats.days[k] ?? { xp: 0, reviews: 0, learned: 0 }
  return {
    ...stats.days,
    [k]: {
      xp: cur.xp + (patch.xp ?? 0),
      reviews: cur.reviews + (patch.reviews ?? 0),
      learned: cur.learned + (patch.learned ?? 0),
    },
  }
}

export const useStore = create<Store>()((set, get) => ({
  ...defaultState(),

  completeOnboarding: (goal) =>
    set((s) => ({ onboarded: true, settings: { ...s.settings, dailyGoal: goal } })),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  addXp: (amount) => {
    if (amount <= 0) return
    const s = get()
    const before = s.stats
    const k = today()
    const prevDayXp = before.days[k]?.xp ?? 0
    const { next: streak, increased, freezeUsed } = touchStreak(before, k)
    const hour = new Date().getHours()
    const newDayXp = prevDayXp + amount
    const goalNow = prevDayXp < s.settings.dailyGoal && newDayXp >= s.settings.dailyGoal
    const stats: Stats = {
      ...before,
      ...streak,
      xp: before.xp + amount,
      days: bumpDay(before, { xp: amount }),
      goalsMet: before.goalsMet + (goalNow ? 1 : 0),
      lateSessions: before.lateSessions + (prevDayXp === 0 && hour >= 22 ? 1 : 0),
      earlySessions: before.earlySessions + (prevDayXp === 0 && hour < 7 && hour >= 4 ? 1 : 0),
    }
    set({ stats })
    const lvBefore = levelInfo(before.xp).level
    const lvAfter = levelInfo(stats.xp).level
    if (increased && streak.streak > 1) emit({ type: 'streak', days: streak.streak, freezeUsed })
    if (goalNow) emit({ type: 'goal' })
    if (lvAfter > lvBefore) emit({ type: 'level', level: lvAfter })
    checkAchievements()
  },

  learnKanji: (results) => {
    const now = new Date()
    set((s) => {
      const progress = { ...s.progress }
      for (const { char, grade } of results) {
        const existing = progress[char]
        const base = existing?.card ?? newCard(now)
        progress[char] = {
          card: review(base, grade, now),
          learnedAt: existing?.learnedAt ?? now.toISOString(),
          correct: (existing?.correct ?? 0) + (grade > 1 ? 1 : 0),
          wrong: (existing?.wrong ?? 0) + (grade === 1 ? 1 : 0),
          writes: existing?.writes ?? 0,
        }
      }
      const fresh = results.filter((r) => !s.progress[r.char]).length
      return {
        progress,
        stats: { ...s.stats, lessons: s.stats.lessons + 1, days: bumpDay(s.stats, { learned: fresh }) },
      }
    })
    checkAchievements()
  },

  recordReview: ({ char, grade, correct, write }) => {
    const now = new Date()
    set((s) => {
      const p = s.progress[char]
      if (!p) return {}
      return {
        progress: {
          ...s.progress,
          [char]: {
            ...p,
            card: review(p.card, grade, now),
            correct: p.correct + (correct ? 1 : 0),
            wrong: p.wrong + (correct ? 0 : 1),
            writes: p.writes + (write && correct ? 1 : 0),
          },
        },
        stats: {
          ...s.stats,
          reviews: s.stats.reviews + 1,
          correct: s.stats.correct + (correct ? 1 : 0),
          wrong: s.stats.wrong + (correct ? 0 : 1),
          writes: s.stats.writes + (write && correct ? 1 : 0),
          days: bumpDay(s.stats, { reviews: 1 }),
        },
      }
    })
  },

  finishSession: ({ perfect, combo, count }) => {
    set((s) => ({
      stats: {
        ...s.stats,
        bestCombo: Math.max(s.stats.bestCombo, combo),
        perfectSessions: s.stats.perfectSessions + (perfect && count >= 10 ? 1 : 0),
      },
    }))
    checkAchievements()
  },

  recordUnit: (unitId, stars) => {
    set((s) => {
      const prev = s.units[unitId]
      return {
        units: {
          ...s.units,
          [unitId]: { done: prev?.done ?? new Date().toISOString(), stars: Math.max(prev?.stars ?? 0, stars) },
        },
      }
    })
    checkAchievements()
  },

  recordGame: (game, score) => {
    const s = get()
    const prev = s.stats.highscores[game] ?? 0
    const isRecord = score > prev
    if (isRecord) set({ stats: { ...s.stats, highscores: { ...s.stats.highscores, [game]: score } } })
    checkAchievements()
    return isRecord && prev > 0
  },

  recordWrite: (char) => {
    set((s) => {
      const p = s.progress[char]
      return {
        stats: { ...s.stats, writes: s.stats.writes + 1 },
        progress: p ? { ...s.progress, [char]: { ...p, writes: p.writes + 1 } } : s.progress,
      }
    })
    checkAchievements()
  },

  resetAll: () => set({ ...defaultState() }),

  importState: (raw) => set({ ...normalizeState(raw) }),

  markBackup: () => set((s) => ({ stats: { ...s.stats, lastBackup: new Date().toISOString(), backupSnoozeUntil: null } })),

  snoozeBackup: (days) => set((s) => ({ stats: { ...s.stats, backupSnoozeUntil: addDays(dayKey(), days) } })),
}))

function checkAchievements() {
  const s = useStore.getState()
  const unlocked: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.id]) continue
    try {
      if (a.check(s)) unlocked.push(a.id)
    } catch {
      /* Prüfung darf nie die App stören */
    }
  }
  if (unlocked.length === 0) return
  const now = new Date().toISOString()
  useStore.setState((st) => ({
    achievements: { ...st.achievements, ...Object.fromEntries(unlocked.map((id) => [id, now])) },
  }))
  unlocked.forEach((id, i) => setTimeout(() => emit({ type: 'achievement', id }), 600 + i * 1800))
}

// ───────────────────────── Persistenz ─────────────────────────

export function snapshot(s: Store = useStore.getState()): PersistedState {
  return {
    version: s.version,
    onboarded: s.onboarded,
    createdAt: s.createdAt,
    settings: s.settings,
    stats: s.stats,
    progress: s.progress,
    units: s.units,
    achievements: s.achievements,
  }
}

async function readStored(): Promise<unknown> {
  try {
    const v = await idbGet(STORAGE_KEY)
    if (v) return v
  } catch {
    /* IndexedDB nicht verfügbar */
  }
  try {
    const ls = localStorage.getItem(STORAGE_KEY)
    if (ls) return JSON.parse(ls)
  } catch {
    /* ignorieren */
  }
  return null
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
let idbOk = true

async function writeStored() {
  const data = snapshot()
  if (idbOk) {
    try {
      await idbSet(STORAGE_KEY, data)
    } catch {
      idbOk = false
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* Speicher voll oder gesperrt */
  }
}

export function flushSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  void writeStored()
}

export async function hydrate(): Promise<void> {
  const raw = await readStored()
  useStore.setState({ ...normalizeState(raw) })
  useStore.subscribe(() => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, 250)
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave()
  })
  window.addEventListener('pagehide', flushSave)
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* optional */
  }
}

// ───────────────────────── Abgeleitete Daten ─────────────────────────

export function dueChars(progress: Record<string, KanjiProgress>, now: Date = new Date()): string[] {
  return Object.entries(progress)
    .filter(([, p]) => new Date(p.card.dueAt).getTime() <= now.getTime())
    .sort((a, b) => new Date(a[1].card.dueAt).getTime() - new Date(b[1].card.dueAt).getTime())
    .map(([c]) => c)
}

export function todayStats(stats: Stats): DayStats {
  return stats.days[today()] ?? { xp: 0, reviews: 0, learned: 0 }
}
