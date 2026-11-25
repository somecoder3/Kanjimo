// Stufe 1 der Daten-Pipeline für JLPT N4–N1:
//  - wählt die Kanji (kanji-data / JLPT-Listen von Jonathan Waller, CC BY),
//  - übernimmt Lesungen (KANJIDIC2, EDRDG, CC BY-SA 4.0),
//  - extrahiert Strichdaten (KanjiVG, CC BY-SA 3.0) → src/data/strokes/n{1..4}.json,
//  - sucht gebräuchliche Beispielwörter (JMdict, EDRDG, CC BY-SA 4.0),
//  - schreibt Eingabe-Stapel für die deutsche Übersetzung nach scripts/.work/batches/.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { parseKanjiVG } from './kanjivg-parse.mjs'

const CACHE = 'scripts/.cache'
const kd = JSON.parse(await readFile(`${CACHE}/kanji-data.json`, 'utf8'))
const jm = JSON.parse(await readFile(`${CACHE}/jmdict/jmdict-eng-common-3.6.2.json`, 'utf8'))
const n5src = await readFile('src/data/kanji.ts', 'utf8')
const N5 = new Set([...n5src.matchAll(/^\s+c: '(.)',$/gm)].map((m) => m[1]))

const toKata = (s) => s.replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
const svgPath = (c) => `${CACHE}/kanjivg/kanji/${c.codePointAt(0).toString(16).padStart(5, '0')}.svg`

// Stufe je Kanji (5 = N5 … 1 = N1); unsere kuratierte N5-Liste hat Vorrang
const level = {}
for (const [c, v] of Object.entries(kd)) if (v.jlpt_new) level[c] = v.jlpt_new
for (const c of N5) level[c] = 5

const LEVELS = [4, 3, 2, 1]
const byLevel = Object.fromEntries(LEVELS.map((l) => [l, []]))
const missing = []
for (const [c, l] of Object.entries(level)) {
  if (l === 5 || N5.has(c)) continue
  if (!existsSync(svgPath(c))) {
    missing.push(c)
    continue
  }
  byLevel[l].push(c)
}
const rank = (c) => kd[c]?.freq ?? 9999
for (const l of LEVELS) byLevel[l].sort((a, b) => rank(a) - rank(b) || (kd[a].strokes ?? 0) - (kd[b].strokes ?? 0))
console.log('Ohne KanjiVG:', missing.join('') || '–')
console.log(Object.fromEntries(LEVELS.map((l) => [`N${l}`, byLevel[l].length])))

// ── Strichdaten ──────────────────────────────────────────────
await mkdir('src/data/strokes', { recursive: true })
const strokes = {}
for (const l of LEVELS) {
  const out = {}
  for (const c of byLevel[l]) {
    const svg = await readFile(svgPath(c), 'utf8')
    out[c] = parseKanjiVG(svg, c)
    strokes[c] = out[c]
    if (out[c].s.length === 0) throw new Error(`${c}: keine Striche`)
  }
  await writeFile(`src/data/strokes/n${l}.json`, JSON.stringify(out))
}

// ── Beispielwörter ───────────────────────────────────────────
// Schwierigkeit eines Wortes = schwerste Stufe der enthaltenen Kanji (5 leicht … 1 schwer, 0 = unbekannt)
const index = new Map()
for (const w of jm.words) {
  const kform = w.kanji.find((k) => k.common) ?? w.kanji[0]
  if (!kform) continue
  const text = kform.text
  if ([...text].length > 4) continue
  const kana = w.kana.find((k) => k.common && (k.appliesToKanji.includes('*') || k.appliesToKanji.includes(text))) ?? w.kana[0]
  if (!kana) continue
  const sense = w.sense.find((s) => !s.misc.some((m) => ['arch', 'obs', 'vulg', 'X', 'sens', 'derog'].includes(m)))
  if (!sense) continue
  const gloss = sense.gloss
    .slice(0, 3)
    .map((g) => g.text)
    .join('; ')
  const chars = [...text].filter((ch) => /[㐀-鿿]/.test(ch))
  if (chars.length === 0) continue
  const diff = Math.min(...chars.map((ch) => level[ch] ?? 0))
  const entry = { w: text, r: kana.text, en: gloss, diff, len: [...text].length, nk: chars.length }
  for (const ch of new Set(chars)) {
    if (!index.has(ch)) index.set(ch, [])
    index.get(ch).push(entry)
  }
}

function pickExamples(c, l) {
  const cands = (index.get(c) ?? []).filter((e) => /^[぀-ヿ]+$/.test(e.r))
  const score = (e) => {
    let s = 0
    if (e.diff >= l) s += 30 // alle Kanji höchstens so schwer wie das Ziel
    else if (e.diff === 0) s -= 40
    else s -= (l - e.diff) * 8
    if (e.len === 2) s += 10
    if (e.nk === 1 && e.len <= 3) s += 12 // Einzelkanji + Okurigana (Kun-Lesung)
    s -= Math.max(0, e.len - 3) * 6
    return s
  }
  const sorted = [...cands].sort((a, b) => score(b) - score(a))
  const out = []
  const readings = new Set()
  for (const e of sorted) {
    if (out.some((o) => o.w === e.w)) continue
    // Abwechslung bei den Lesungen bevorzugen
    if (out.length > 0 && readings.has(e.r)) continue
    out.push(e)
    readings.add(e.r)
    if (out.length === 3) break
  }
  return out.map(({ w, r, en }) => ({ w, r, en }))
}

// ── Eingabe-Stapel für die Übersetzung ───────────────────────
await mkdir('scripts/.work/batches', { recursive: true })
const all = []
for (const l of LEVELS) {
  for (const c of byLevel[l]) {
    const k = kd[c]
    const comps = (strokes[c].p ?? [])
      .map((p) => p.el)
      .filter((el) => el !== c)
      .map((el) => (kd[el]?.meanings?.length ? `${el} (${kd[el].meanings.slice(0, 2).join(', ')})` : el))
    all.push({
      c,
      level: l,
      en: k.meanings,
      on: (k.readings_on ?? []).map(toKata),
      kun: k.readings_kun ?? [],
      parts: comps,
      ex: pickExamples(c, l),
    })
  }
}
const noEx = all.filter((a) => a.ex.length === 0).map((a) => a.c)
console.log(`Kanji gesamt: ${all.length}, ohne Beispiel: ${noEx.length}`, noEx.slice(0, 60).join(''))
console.log('mit 1 Beispiel:', all.filter((a) => a.ex.length === 1).length)

const SIZE = 60
let n = 0
for (let i = 0; i < all.length; i += SIZE) {
  await writeFile(`scripts/.work/batches/in-${String(n).padStart(3, '0')}.json`, JSON.stringify(all.slice(i, i + SIZE), null, 1))
  n++
}
await writeFile('scripts/.work/all.json', JSON.stringify(all))
console.log(`${n} Stapel geschrieben.`)
