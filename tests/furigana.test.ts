import { describe, expect, it } from 'vitest'
import { KANJI } from '../src/data/kanji'
import { loadAllLevels } from '../src/data/levels'
import { readingRanges } from '../src/lib/furigana'

await loadAllLevels()

const part = (w: string, r: string, c: string) => readingRanges(w, r, c)?.map(([a, b]) => r.slice(a, b)) ?? null

describe('Lesungsanteil im Beispielwort', () => {
  it('ordnet typische Fälle richtig zu', () => {
    expect(part('学校', 'がっこう', '学')).toEqual(['がっ'])
    expect(part('学校', 'がっこう', '校')).toEqual(['こう'])
    expect(part('食べる', 'たべる', '食')).toEqual(['た'])
    expect(part('日本', 'にほん', '本')).toEqual(['ほん'])
    expect(part('三本', 'さんぼん', '本')).toEqual(['ぼん'])
    expect(part('人々', 'ひとびと', '人')).toEqual(['ひと'])
    expect(part('一人一人', 'ひとりひとり', '一')).toEqual(['ひと', 'ひと'])
  })
  it('lässt Sonderlesungen ungefärbt', () => {
    expect(part('今日', 'きょう', '今')).toBeNull()
    expect(part('大人', 'おとな', '大')).toBeNull()
  })
  it('deckt fast alle Beispielwörter ab, Abschnitte liegen innerhalb der Lesung', () => {
    let total = 0
    let ok = 0
    for (const k of KANJI)
      for (const ex of k.examples) {
        total++
        const rr = readingRanges(ex.w, ex.r, k.c)
        if (!rr) continue
        ok++
        for (const [a, b] of rr) {
          expect(a).toBeGreaterThanOrEqual(0)
          expect(b).toBeGreaterThan(a)
          expect(b).toBeLessThanOrEqual(ex.r.length)
        }
      }
    expect(ok / total).toBeGreaterThan(0.98)
  })
})
