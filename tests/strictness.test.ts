import { describe, expect, it } from 'vitest'
import { matchStroke } from '../src/lib/geometry'
import { strokePolylines } from '../src/data/strokes'
import { KANJI_ORDER } from '../src/data/kanji'
import { loadAllLevels } from '../src/data/levels'

await loadAllLevels()

describe('Stricherkennung ist nicht zu nachsichtig', () => {
  it('ein anderer Strich des Zeichens wird fast nie als der erwartete akzeptiert', () => {
    let pairs = 0
    const falseAccepts: string[] = []
    for (const c of KANJI_ORDER) {
      const refs = strokePolylines(c)
      for (let i = 0; i < refs.length; i++) {
        for (let j = 0; j < refs.length; j++) {
          if (i === j) continue
          pairs++
          if (matchStroke(refs[j], refs, i, { leniency: 1.3 }).verdict === 'ok') falseAccepts.push(`${c}:${j + 1}→${i + 1}`)
        }
      }
    }
    console.log(`Paare: ${pairs}, fälschlich akzeptiert: ${falseAccepts.length}`, falseAccepts.slice(0, 40).join(' '))
    expect(falseAccepts.length / pairs).toBeLessThan(0.01)
  })
})
