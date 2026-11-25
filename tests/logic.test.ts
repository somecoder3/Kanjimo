import { describe, expect, it, beforeAll } from 'vitest'
import { displayStreak, levelInfo, touchStreak, xpForLevel, type StreakState } from '../src/lib/gamification'
import { addDays, diffDays } from '../src/lib/date'
import { distractors, makeQuestion, meaningLabel } from '../src/lib/quiz'
import { KANJI_MAP, KANJI_ORDER } from '../src/data/kanji'
import { initSrs, newCard, review, GRADE, mastery, isDue } from '../src/lib/srs'
import { normalizeState } from '../src/lib/store'
import { loadAllLevels } from '../src/data/levels'

await loadAllLevels()

const base: StreakState = { streak: 0, bestStreak: 0, lastActiveDay: null, freezes: 0, frozenDays: [] }

describe('Datum', () => {
  it('rechnet über Monats-, Jahres- und Zeitumstellungsgrenzen', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2)
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2)
  })
})

describe('Serie', () => {
  it('beginnt bei 1 und wächst täglich', () => {
    let s = touchStreak(base, '2026-01-01').next
    expect(s.streak).toBe(1)
    s = touchStreak(s, '2026-01-01').next
    expect(s.streak).toBe(1)
    s = touchStreak(s, '2026-01-02').next
    expect(s.streak).toBe(2)
  })
  it('reißt nach einer Lücke ohne Schutz', () => {
    const s = touchStreak({ ...base, streak: 5, bestStreak: 5, lastActiveDay: '2026-01-01' }, '2026-01-04').next
    expect(s.streak).toBe(1)
    expect(s.bestStreak).toBe(5)
  })
  it('Serienschutz rettet verpasste Tage', () => {
    const r = touchStreak({ ...base, streak: 9, bestStreak: 9, lastActiveDay: '2026-01-01', freezes: 2 }, '2026-01-03')
    expect(r.next.streak).toBe(10)
    expect(r.freezeUsed).toBe(1)
    expect(r.next.freezes).toBe(1)
    expect(r.next.frozenDays).toContain('2026-01-02')
  })
  it('vergibt alle 7 Tage einen Serienschutz (max. 2)', () => {
    let s: StreakState = { ...base }
    for (let d = 0; d < 21; d++) s = touchStreak(s, addDays('2026-01-01', d)).next
    expect(s.streak).toBe(21)
    expect(s.freezes).toBe(2)
  })
  it('zeigt eine gerissene Serie als 0', () => {
    expect(displayStreak({ ...base, streak: 4, lastActiveDay: '2026-01-01' }, '2026-01-02')).toMatchObject({ days: 4, atRisk: true })
    expect(displayStreak({ ...base, streak: 4, lastActiveDay: '2026-01-01' }, '2026-01-05').days).toBe(0)
  })
})

describe('Level', () => {
  it('Kurve ist monoton und konsistent', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelInfo(0).level).toBe(1)
    expect(levelInfo(49).level).toBe(1)
    expect(levelInfo(50).level).toBe(2)
    for (let xp = 0; xp < 5000; xp += 37) {
      const l = levelInfo(xp)
      expect(l.progress).toBeGreaterThanOrEqual(0)
      expect(l.progress).toBeLessThan(1)
    }
  })
})

describe('Quiz', () => {
  it('Ablenker teilen nie eine Bedeutung mit der Lösung', () => {
    for (const c of KANJI_ORDER) {
      for (let k = 0; k < 4; k++) {
        const ds = distractors(c, KANJI_ORDER, 3, k % 2 === 0)
        expect(ds).toHaveLength(3)
        expect(new Set(ds).size).toBe(3)
        for (const d of ds) {
          expect(d).not.toBe(c)
          const shared = KANJI_MAP[d].meanings.some((m) => KANJI_MAP[c].meanings.includes(m))
          expect(shared, `${c} vs ${d}`).toBe(false)
          expect(meaningLabel(d)).not.toBe(meaningLabel(c))
        }
      }
    }
  })
  it('Fragen haben genau eine richtige Antwort und 4 eindeutige Optionen', () => {
    for (const c of KANJI_ORDER) {
      for (const t of ['meaning', 'kanji', 'reading'] as const) {
        const q = makeQuestion(c, t, KANJI_ORDER)
        if (q.type === 'write') continue
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.options.filter((o) => o === q.answer)).toHaveLength(1)
        if (t === 'meaning') expect(q.answer).toBe(meaningLabel(c))
      }
    }
  })
  it('funktioniert auch mit sehr kleinem Pool', () => {
    const q = makeQuestion('一', 'meaning', ['一', '二'])
    expect(q.type === 'meaning' && q.options.length).toBe(4)
  })
})

describe('FSRS', () => {
  beforeAll(async () => {
    await initSrs()
  })
  it('plant neue Karten sinnvoll ein und bleibt JSON-tauglich', () => {
    const now = new Date('2026-01-01T10:00:00Z')
    const c = review(newCard(now), GRADE.good, now)
    const json = JSON.parse(JSON.stringify(c))
    expect(isDue(json, now)).toBe(false)
    expect(isDue(json, new Date('2026-01-03T10:00:00Z'))).toBe(true)
    const later = new Date('2026-01-03T10:00:00Z')
    const again = review(json, GRADE.again, later)
    expect(new Date(again.dueAt).getTime() - later.getTime()).toBeLessThan(60 * 60 * 1000)
    expect(mastery(undefined)).toBe(0)
    expect(mastery(c)).toBeGreaterThanOrEqual(1)
  })
  it('Erfolgsserien verlängern das Intervall', () => {
    let now = new Date('2026-01-01T10:00:00Z')
    let c = newCard(now)
    let last = 0
    for (let i = 0; i < 5; i++) {
      c = review(c, GRADE.good, now)
      const due = new Date(c.dueAt)
      const interval = due.getTime() - now.getTime()
      expect(interval).toBeGreaterThanOrEqual(last)
      last = interval
      now = due
    }
  })
})

describe('Speicherstand', () => {
  it('normalisiert kaputte oder alte Daten', () => {
    const s = normalizeState({ onboarded: true, settings: { sound: false }, stats: { xp: 12 } })
    expect(s.onboarded).toBe(true)
    expect(s.settings.sound).toBe(false)
    expect(s.settings.dailyGoal).toBe(40)
    expect(s.stats.xp).toBe(12)
    expect(s.stats.highscores).toEqual({})
    expect(normalizeState(null).onboarded).toBe(false)
    expect(normalizeState('kaputt').progress).toEqual({})
  })
})
