// Stufe 2 der Daten-Pipeline: führt Rohdaten (scripts/.work/all.json) mit den deutschen
// Inhalten (scripts/.work/batches/out-*.json) zusammen und schreibt src/data/levels/n{1..4}.json.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'

const all = JSON.parse(await readFile('scripts/.work/all.json', 'utf8'))
const de = new Map()
const dir = 'scripts/.work/batches'
for (const f of (await readdir(dir)).filter((f) => f.startsWith('out-')).sort()) {
  const inp = JSON.parse(await readFile(`${dir}/${f.replace('out-', 'in-')}`, 'utf8'))
  const out = JSON.parse(await readFile(`${dir}/${f}`, 'utf8'))
  if (out.length !== inp.length) throw new Error(`${f}: ${out.length} statt ${inp.length} Einträge`)
  out.forEach((o, i) => {
    if (o.c !== inp[i].c) throw new Error(`${f}: Reihenfolge falsch bei ${i} (${o.c} ≠ ${inp[i].c})`)
    de.set(o.c, o)
  })
}

const KUN = /^-?[぀-ゟ]+(\.[぀-ゟ]+)?-?$/
const ON = /^[゠-ヿ]+$/
const problems = []
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

const byLevel = { 4: [], 3: [], 2: [], 1: [] }
let missing = 0
for (const k of all) {
  const d = de.get(k.c)
  if (!d) {
    missing++
    continue
  }
  const meanings = [...new Set((d.m ?? []).map(clean).filter(Boolean))].slice(0, 3)
  const mnemonic = clean(d.mn)
  if (meanings.length === 0) problems.push(`${k.c}: keine Bedeutung`)
  if (mnemonic.length < 15) problems.push(`${k.c}: Eselsbrücke fehlt/zu kurz`)
  if (/[A-Za-z]{4,}/.test(meanings.join(' ')) && /\b(the|to|of|and)\b/i.test(meanings.join(' '))) problems.push(`${k.c}: Bedeutung englisch? ${meanings}`)
  const examples = k.ex.map((e, i) => ({ w: e.w, r: e.r, m: clean(d.ex?.[i]) })).filter((e) => e.m)
  if (examples.length !== k.ex.length) problems.push(`${k.c}: Beispielübersetzung fehlt`)
  byLevel[k.level].push({
    c: k.c,
    meanings,
    on: k.on.filter((r) => ON.test(r)),
    kun: k.kun.filter((r) => KUN.test(r)),
    mnemonic,
    examples,
  })
}

await mkdir('src/data/levels', { recursive: true })
for (const [l, list] of Object.entries(byLevel)) {
  await writeFile(`src/data/levels/n${l}.json`, JSON.stringify(list))
  console.log(`N${l}: ${list.length} Kanji`)
}
console.log(`Fehlende deutsche Einträge: ${missing}`)
if (problems.length) console.log(`Auffälligkeiten (${problems.length}):\n` + problems.slice(0, 80).join('\n'))
