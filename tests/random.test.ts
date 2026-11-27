import { describe, expect, it } from 'vitest'
import { weightedSample } from '../src/lib/random'

describe('weightedSample', () => {
  it('zieht ohne Zurücklegen und höchstens n Elemente', () => {
    const r = weightedSample([1, 2, 3, 4, 5], 3, () => 1)
    expect(r).toHaveLength(3)
    expect(new Set(r).size).toBe(3)
    expect(weightedSample([1, 2], 5, () => 1)).toHaveLength(2)
  })

  it('mischt gleich gewichtete Elemente gleichmäßig', () => {
    const items = Array.from({ length: 50 }, (_, i) => i)
    const hits = new Array(50).fill(0)
    for (let k = 0; k < 2000; k++) for (const x of weightedSample(items, 8, () => 1)) hits[x]++
    // Erwartung je Element: 2000 * 8 / 50 = 320
    expect(Math.min(...hits)).toBeGreaterThan(220)
    expect(Math.max(...hits)).toBeLessThan(420)
  })

  it('bevorzugt schwerere Gewichte', () => {
    const hits = { a: 0, b: 0 }
    for (let k = 0; k < 2000; k++) hits[weightedSample(['a', 'b'] as const, 1, (x) => (x === 'a' ? 3 : 1))[0]]++
    expect(hits.a).toBeGreaterThan(hits.b * 2)
  })
})
