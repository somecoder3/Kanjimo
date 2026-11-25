import { describe, expect, it } from 'vitest'
import { KANJI, KANJI_MAP, UNITS, KANJI_ORDER } from '../src/data/kanji'
import { strokeCount, strokePaths } from '../src/data/strokes'
import { ACHIEVEMENTS } from '../src/data/achievements'
import { loadAllLevels } from '../src/data/levels'

await loadAllLevels()

const KATA = /^[゠-ヿ]+$/
const HIRA_KUN = /^-?[぀-ゟ]+(\.[぀-ゟ]+)?-?$/
const KANA = /^[぀-ヿ]+$/

describe('Kanji-Daten', () => {
  it('enthält keine doppelten Kanji', () => {
    expect(new Set(KANJI.map((k) => k.c)).size).toBe(KANJI.length)
  })

  it('jede Einheit verweist nur auf vorhandene Kanji, jedes Kanji kommt genau einmal vor', () => {
    expect(KANJI_ORDER.length).toBe(KANJI.length)
    expect(new Set(KANJI_ORDER).size).toBe(KANJI_ORDER.length)
    for (const c of KANJI_ORDER) expect(KANJI_MAP[c], c).toBeDefined()
    UNITS.forEach((u, i) => expect(u.id).toBe(i + 1))
  })

  it.each(KANJI.map((k) => [k.c, k] as const))('%s ist vollständig und korrekt formatiert', (c, k) => {
    expect(k.meanings.length).toBeGreaterThan(0)
    expect(k.mnemonic.length).toBeGreaterThan(20)
    expect(k.on.length + k.kun.length).toBeGreaterThan(0)
    for (const r of k.on) expect(r, `On ${r}`).toMatch(KATA)
    for (const r of k.kun) expect(r, `Kun ${r}`).toMatch(HIRA_KUN)
    expect(k.examples.length).toBeGreaterThanOrEqual(k.level === 5 ? 2 : 0)
    expect(k.meanings.length).toBeLessThanOrEqual(3)
    for (const ex of k.examples) {
      expect(ex.w, `Beispiel ${ex.w}`).toContain(c)
      expect(ex.r, `Lesung ${ex.r}`).toMatch(KANA)
      expect(ex.m.length).toBeGreaterThan(0)
    }
    expect(strokeCount(c)).toBeGreaterThan(0)
    for (const d of strokePaths(c)) expect(d).toMatch(/^[Mm]/)
  })

  it('bekannte Strichzahlen stimmen', () => {
    const known: Record<string, number> = { 一: 1, 木: 4, 女: 3, 書: 10, 曜: 18, 聞: 14, 駅: 14, 右: 5, 左: 5, 九: 2, 飲: 12 }
    for (const [c, n] of Object.entries(known)) expect(strokeCount(c), c).toBe(n)
  })

  it('enthält alle Stufen N5–N1 in sinnvollem Umfang', () => {
    const per = [5, 4, 3, 2, 1].map((l) => KANJI.filter((k) => k.level === l).length)
    expect(per[0]).toBe(103)
    for (const n of per.slice(1)) expect(n).toBeGreaterThan(100)
    expect(KANJI.length).toBeGreaterThan(2000)
    for (const u of UNITS) expect(u.kanji.every((c) => KANJI_MAP[c].level === u.level)).toBe(true)
  })

  it('Erfolge haben eindeutige IDs', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })
})
