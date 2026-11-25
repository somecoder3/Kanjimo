// Schneidet die japanischen Schriften auf genau die Zeichen zu, die Kanjimo verwendet.
// Ergebnis: kleine WOFF2-Dateien in src/fonts/, die vollständig offline vorgehalten werden.
// Schriften: M PLUS Rounded 1c & Klee One (SIL Open Font License 1.1).
import subsetFont from 'subset-font'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (/\.(tsx?|css)$/.test(e.name) || (/\.json$/.test(e.name) && p.includes('levels'))) out.push(p)
  }
  return out
}

const files = await walk('src')
let text = ''
for (const f of files) text += await readFile(f, 'utf8')

// Alle Hiragana/Katakana vollständig + alle CJK-Zeichen aus dem Quelltext + Satzzeichen
const chars = new Set()
for (let c = 0x3040; c <= 0x30ff; c++) chars.add(String.fromCodePoint(c))
for (const ch of '、。「」『』（）！？・ー～〜　…'.split('')) chars.add(ch)
for (const ch of text) {
  const cp = ch.codePointAt(0)
  if ((cp >= 0x3000 && cp <= 0x9fff) || (cp >= 0xff00 && cp <= 0xffef)) chars.add(ch)
}
const subsetText = [...chars].join('')
console.log(`${chars.size} japanische Zeichen`)

await mkdir('src/fonts', { recursive: true })
const jobs = [
  ['m-plus-rounded-1c', 500],
  ['m-plus-rounded-1c', 700],
  ['m-plus-rounded-1c', 800],
  ['klee-one', 600],
]
// Japanisch: ein Schnitt je Familie genügt (spart rund zwei Drittel der Größe)
const jpJobs = [
  ['m-plus-rounded-1c', 700],
  ['klee-one', 600],
]
for (const [fam, w] of jpJobs) {
  const src = await readFile(`node_modules/@fontsource/${fam}/files/${fam}-japanese-${w}-normal.woff2`)
  const out = await subsetFont(src, subsetText, { targetFormat: 'woff2' })
  await writeFile(`src/fonts/${fam}-jp-${w}.woff2`, out)
  console.log(`${fam} ${w}: ${(src.length / 1024).toFixed(0)} KB → ${(out.length / 1024).toFixed(1)} KB`)
}

// Lateinische Teilmengen unverändert übernehmen
const { copyFile } = await import('node:fs/promises')
for (const [fam, w] of jobs) {
  await copyFile(`node_modules/@fontsource/${fam}/files/${fam}-latin-${w}-normal.woff2`, `src/fonts/${fam}-latin-${w}.woff2`)
}
console.log('Lateinische Schriften kopiert.')
