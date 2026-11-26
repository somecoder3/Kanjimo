// Ordnet die Lesung eines Beispielworts den einzelnen Zeichen zu (z. B. 学校 がっこう → 学=がっ, 校=こう),
// damit der Anteil des gesuchten Kanji in der Lesung hervorgehoben werden kann.
import { KANJI_MAP } from '../data/kanji'

const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
const isKana = (c: string) => /[ぁ-ゖァ-ヺー]/.test(c)

const VOICED: Record<string, string[]> = {
  か: ['が'], き: ['ぎ'], く: ['ぐ'], け: ['げ'], こ: ['ご'],
  さ: ['ざ'], し: ['じ'], す: ['ず'], せ: ['ぜ'], そ: ['ぞ'],
  た: ['だ'], ち: ['ぢ', 'じ'], つ: ['づ', 'ず'], て: ['で'], と: ['ど'],
  は: ['ば', 'ぱ'], ひ: ['び', 'ぴ'], ふ: ['ぶ', 'ぷ'], へ: ['べ', 'ぺ'], ほ: ['ぼ', 'ぽ'],
}

const cache = new Map<string, string[]>()

/** Mögliche Lesungen eines Kanji inkl. Stimmhaftwerdung (Rendaku) und Verdopplung (っ). */
function candidates(k: string): string[] {
  const hit = cache.get(k)
  if (hit) return hit
  const e = KANJI_MAP[k]
  const base = new Set<string>()
  if (e) {
    for (const r of e.on) base.add(toHira(r))
    for (const r of e.kun) {
      const clean = r.replace(/-/g, '')
      const [stem] = clean.split('.')
      if (stem) base.add(stem)
      base.add(clean.replace('.', ''))
    }
  }
  const out = new Set<string>()
  for (const r of base) {
    if (!r) continue
    const variants = [r, ...(VOICED[r[0]] ?? []).map((v) => v + r.slice(1))]
    for (const v of variants) {
      out.add(v)
      if (v.length >= 2 && 'つくちきう'.includes(v[v.length - 1])) out.add(v.slice(0, -1) + 'っ')
    }
  }
  const list = [...out].sort((a, b) => b.length - a.length)
  cache.set(k, list)
  return list
}

interface Seg {
  from: number
  to: number
  guessed: boolean
}

/**
 * Liefert für jedes Vorkommen von `char` in `word` den zugehörigen Abschnitt [von, bis) in `reading`.
 * Gibt null zurück, wenn sich die Lesung nicht sicher zuordnen lässt (z. B. 今日 = きょう).
 */
export function readingRanges(word: string, reading: string, char: string): [number, number][] | null {
  const w = [...word]
  const r = toHira(reading)
  const memo = new Map<string, { cost: number; segs: Seg[] } | null>()

  const solve = (i: number, j: number): { cost: number; segs: Seg[] } | null => {
    if (i === w.length) return j === r.length ? { cost: 0, segs: [] } : null
    if (j >= r.length) return null
    const key = i + ':' + j
    if (memo.has(key)) return memo.get(key)!
    let best: { cost: number; segs: Seg[] } | null = null
    const tryLen = (len: number, cost: number, guessed: boolean) => {
      const rest = solve(i + 1, j + len)
      if (rest && (!best || rest.cost + cost < best.cost)) best = { cost: rest.cost + cost, segs: [{ from: j, to: j + len, guessed }, ...rest.segs] }
    }
    const ch = w[i]
    if (isKana(ch)) {
      if (toHira(ch) === r[j] || ch === 'ー') tryLen(1, 0, false)
    } else {
      const k = ch === '々' && i > 0 ? w[i - 1] : ch
      for (const c of candidates(k)) if (r.startsWith(c, j)) tryLen(c.length, 0, false)
      for (let len = 1; len <= 5 && j + len <= r.length; len++) tryLen(len, 10 + len, true)
    }
    memo.set(key, best)
    return best
  }

  const res = solve(0, 0)
  if (!res) return null
  const idx = w.map((c, i) => (c === char ? i : -1)).filter((i) => i >= 0)
  if (idx.length === 0) return null
  const guessedCount = res.segs.filter((s) => s.guessed).length
  // Geschätzt ist nur sicher, wenn das gesuchte Kanji das einzige unbekannte Stück ist
  if (idx.some((i) => res.segs[i].guessed) && guessedCount > 1) return null
  return idx.map((i) => [res.segs[i].from, res.segs[i].to])
}
