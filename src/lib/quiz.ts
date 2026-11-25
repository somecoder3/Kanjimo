/** Erzeugt abwechslungsreiche Abfragen (Interleaving) für Lektionen, Wiederholungen und Spiele. */
import { KANJI, KANJI_MAP, KANJI_ORDER, type Example } from '../data/kanji'
import { parts, strokeCount } from '../data/strokes'
import { shuffle } from './random'
import type { StoredCard } from './srs'

export type QType = 'meaning' | 'kanji' | 'reading' | 'write'

export interface ChoiceQuestion {
  type: 'meaning' | 'kanji' | 'reading'
  char: string
  options: string[]
  answer: string
  example?: Example
}

export interface WriteQuestion {
  type: 'write'
  char: string
}

export type Question = ChoiceQuestion | WriteQuestion

/** Kurzform der Bedeutung, wie sie in Antworten angezeigt wird. */
export function meaningLabel(c: string): string {
  return KANJI_MAP[c].meanings.slice(0, 2).join(', ')
}

function sharesMeaning(a: string, b: string): boolean {
  const ma = KANJI_MAP[a].meanings.map((m) => m.toLowerCase())
  return KANJI_MAP[b].meanings.some((m) => ma.includes(m.toLowerCase()))
}

/** Ähnlichkeit für knifflige Ablenker: gemeinsame Bausteine, ähnliche Strichzahl. */
function similarity(a: string, b: string): number {
  const pa = parts(a).map((p) => p.el)
  const pb = parts(b).map((p) => p.el)
  const shared = pa.filter((x) => pb.includes(x) || x === b).length + (pb.includes(a) ? 1 : 0)
  const sd = Math.abs(strokeCount(a) - strokeCount(b))
  return shared * 3 + Math.max(0, 3 - sd)
}

export function distractors(char: string, pool: string[], n: number, hard = false): string[] {
  const base = pool.length >= n + 1 ? pool : KANJI_ORDER
  let cands = base.filter((c) => c !== char && !sharesMeaning(c, char))
  if (cands.length < n) {
    const extra = KANJI_ORDER.filter((c) => c !== char && !cands.includes(c) && !sharesMeaning(c, char))
    cands = [...cands, ...extra]
  }
  if (hard) {
    const scored = shuffle(cands).map((c) => [c, similarity(char, c)] as const)
    const ranked = scored.sort((x, y) => y[1] - x[1]).map(([c]) => c)
    return shuffle([...ranked.slice(0, Math.max(1, n - 1)), ...shuffle(ranked.slice(n - 1)).slice(0, 1)]).slice(0, n)
  }
  return shuffle(cands).slice(0, n)
}

let examplesCache: { n: number; list: Example[] } | null = null
function allExamples(): Example[] {
  if (!examplesCache || examplesCache.n !== KANJI.length) examplesCache = { n: KANJI.length, list: KANJI.flatMap((k) => k.examples) }
  return examplesCache.list
}

function readingDistractors(ex: Example, n: number): string[] {
  const len = ex.r.length
  const cands = [...new Set(allExamples().map((e) => e.r))].filter((r) => r !== ex.r)
  const close = shuffle(cands.filter((r) => Math.abs(r.length - len) <= 1))
  const rest = shuffle(cands.filter((r) => Math.abs(r.length - len) > 1))
  return [...close, ...rest].slice(0, n)
}

export function makeQuestion(char: string, type: QType, pool: string[], hard = false): Question {
  if (type === 'write') return { type: 'write', char }
  if (type === 'meaning') {
    const opts = distractors(char, pool, 3, hard).map(meaningLabel)
    const answer = meaningLabel(char)
    return { type, char, answer, options: shuffle([answer, ...opts]) }
  }
  if (type === 'kanji') {
    const opts = distractors(char, pool, 3, hard)
    return { type, char, answer: char, options: shuffle([char, ...opts]) }
  }
  // Lesung eines Beispielworts (ohne Beispiele → Bedeutungsfrage)
  const examples = KANJI_MAP[char].examples
  if (examples.length === 0) return makeQuestion(char, 'meaning', pool, hard)
  const ex = examples[Math.floor(Math.random() * examples.length)]
  return { type: 'reading', char, example: ex, answer: ex.r, options: shuffle([ex.r, ...readingDistractors(ex, 3)]) }
}

/** Wählt den Aufgabentyp passend zur Gedächtnisstabilität (Desirable Difficulties). */
export function pickType(card: StoredCard | undefined, allowWrite: boolean, rnd: () => number = Math.random): QType {
  const st = card?.stability ?? 0
  const r = rnd()
  if (st < 2) return r < 0.55 ? 'meaning' : r < 0.85 ? 'kanji' : allowWrite ? 'write' : 'reading'
  if (st < 8) return r < 0.3 ? 'meaning' : r < 0.55 ? 'kanji' : r < 0.8 ? 'reading' : allowWrite ? 'write' : 'kanji'
  return r < 0.2 ? 'meaning' : r < 0.4 ? 'kanji' : r < 0.65 ? 'reading' : allowWrite ? 'write' : 'reading'
}
