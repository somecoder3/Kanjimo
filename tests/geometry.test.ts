import { describe, expect, it } from 'vitest'
import { matchStroke, parsePath, pathToPolyline, resample, polylineLength, type Pt } from '../src/lib/geometry'
import { strokePolylines } from '../src/data/strokes'
import { KANJI_ORDER } from '../src/data/kanji'
import { loadAllLevels } from '../src/data/levels'

await loadAllLevels()

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function jitter(pts: Pt[], amount: number, r: () => number): Pt[] {
  return resample(pts, 20).map((p) => ({ x: p.x + (r() - 0.5) * amount, y: p.y + (r() - 0.5) * amount }))
}

describe('Pfad-Parser', () => {
  it('liest absolute und relative Kurven', () => {
    const segs = parsePath('M10,10c0,10,10,10,10,0C30,0,40,0,40,10s10,10,10,0')
    expect(segs.length).toBe(3)
    expect(segs[0][3]).toEqual({ x: 20, y: 10 })
    expect(segs[2][3]).toEqual({ x: 50, y: 10 })
  })
  it('erzeugt eine plausible Polylinie', () => {
    expect(polylineLength(pathToPolyline('M0,0C0,0,100,0,100,0'))).toBeCloseTo(100, 0)
  })
  it('resample liefert genau n Punkte', () => {
    expect(resample([{ x: 0, y: 0 }, { x: 10, y: 0 }], 32)).toHaveLength(32)
    expect(resample([{ x: 5, y: 5 }], 8)).toHaveLength(8)
  })
})

describe('Stricherkennung', () => {
  const r = rng(42)
  it.each(KANJI_ORDER)('erkennt jeden Strich von %s (leicht verwackelt)', (c) => {
    const refs = strokePolylines(c)
    refs.forEach((ref, i) => {
      const res = matchStroke(jitter(ref, 4, r), refs, i, { leniency: 1.1 })
      expect(res.verdict, `${c} Strich ${i + 1}`).toBe('ok')
    })
  })

  it('erkennt falsche Richtung', () => {
    const refs = strokePolylines('一')
    expect(matchStroke([...refs[0]].reverse(), refs, 0).verdict).toBe('reversed')
  })

  it('erkennt falsche Reihenfolge', () => {
    const refs = strokePolylines('三')
    expect(matchStroke(refs[2], refs, 0).verdict).toBe('order')
  })

  it('lehnt völlig falsche Striche ab', () => {
    const refs = strokePolylines('一')
    const vertical = [
      { x: 54, y: 10 },
      { x: 54, y: 95 },
    ]
    expect(matchStroke(vertical, refs, 0).verdict).toBe('miss')
    expect(matchStroke([{ x: 50, y: 50 }], refs, 0).verdict).toBe('miss')
  })

  it('verwechselt parallele Striche nicht (三: Strich 1 an Stelle von Strich 2)', () => {
    const refs = strokePolylines('三')
    expect(matchStroke(refs[0], refs, 1).verdict).not.toBe('ok')
  })
})
