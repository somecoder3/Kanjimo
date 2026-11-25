// Lädt die Strichdaten aller Kanji aus KanjiVG (https://kanjivg.tagaini.net)
// und schreibt sie kompakt nach src/data/strokes.json.
// KanjiVG © Ulrich Apel, lizenziert unter CC BY-SA 3.0.
import { readFile, writeFile } from 'node:fs/promises'

const src = await readFile(new URL('../src/data/kanji.ts', import.meta.url), 'utf8')
const chars = [...src.matchAll(/^\s+c: '(.)',$/gm)].map((m) => m[1])
if (chars.length === 0) throw new Error('Keine Kanji gefunden')

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/'

function parse(svg, char) {
  const hex = char.codePointAt(0).toString(16).padStart(5, '0')
  const tagRe = /<(\/?)(g|path)\b([^>]*?)(\/?)>/g
  const strokes = []
  const stack = [] // { el, from, depth }
  const parts = []
  let inStrokes = false
  let rootDepth = -1
  let depth = 0
  for (const m of svg.matchAll(tagRe)) {
    const [, closing, tag, attrs, selfClosing] = m
    const attr = (name) => attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]
    if (tag === 'g' && !closing) {
      depth++
      const id = attr('id') ?? ''
      if (id === `kvg:StrokePaths_${hex}`) inStrokes = true
      if (id === `kvg:${hex}`) rootDepth = depth
      stack.push({ el: attr('kvg:element'), from: strokes.length, depth })
    } else if (tag === 'g' && closing) {
      const g = stack.pop()
      if (inStrokes && g && g.depth === rootDepth + 1 && g.el) {
        const idx = []
        for (let i = g.from; i < strokes.length; i++) idx.push(i)
        // Geteilte Bausteine (z. B. 囗 in 国) zusammenführen
        const same = parts.find((p) => p.el === g.el)
        if (same) same.i.push(...idx)
        else parts.push({ el: g.el, i: idx })
      }
      depth--
    } else if (tag === 'path' && inStrokes) {
      const d = attr('d')
      if (d) strokes.push(d.replace(/\s+/g, ' ').trim())
      if (!selfClosing) throw new Error('Unerwartetes path-Tag')
    }
  }
  return { s: strokes, p: parts }
}

const out = {}
for (const c of chars) {
  const hex = c.codePointAt(0).toString(16).padStart(5, '0')
  const res = await fetch(BASE + hex + '.svg')
  if (!res.ok) throw new Error(`${c} (${hex}): HTTP ${res.status}`)
  const svg = await res.text()
  // Nur den Stroke-Teil verwenden (Zahlen-Gruppe ignorieren)
  const strokePart = svg.slice(0, svg.indexOf(`kvg:StrokeNumbers_${hex}`))
  const data = parse(strokePart, c)
  if (data.s.length === 0) throw new Error(`${c}: keine Striche`)
  out[c] = data
  process.stdout.write(`${c}${data.s.length} `)
}
await writeFile(
  new URL('../src/data/strokes.json', import.meta.url),
  JSON.stringify(out),
)
console.log(`\n${chars.length} Kanji gespeichert.`)
