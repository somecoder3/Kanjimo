// Gemeinsamer KanjiVG-Parser: liefert Strichpfade und Bausteine (oberste Ebene).
// KanjiVG © Ulrich Apel, CC BY-SA 3.0.

/** Rundet Zahlen in Pfaden auf eine Nachkommastelle (spart ~25 % Größe, unsichtbar bei 109er-Raster). */
export function compactPath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  let out = ''
  let prevNum = false
  for (const t of tokens) {
    if (/[a-zA-Z]/.test(t)) {
      out += t
      prevNum = false
      continue
    }
    let r = Math.round(parseFloat(t) * 10) / 10
    if (Object.is(r, -0)) r = 0
    const s = String(r).replace(/^(-?)0\./, '$1.')
    // Trennzeichen nur, wenn kein Minus die Zahlen eindeutig trennt
    out += prevNum && !s.startsWith('-') ? ',' + s : s
    prevNum = true
  }
  return out
}

export function parseKanjiVG(svg, char) {
  const hex = char.codePointAt(0).toString(16).padStart(5, '0')
  const end = svg.indexOf(`kvg:StrokeNumbers_${hex}`)
  const part = end > 0 ? svg.slice(0, end) : svg
  const tagRe = /<(\/?)(g|path)\b([^>]*?)(\/?)>/g
  const strokes = []
  const stack = []
  const parts = []
  let rootDepth = -1
  let depth = 0
  let inStrokes = false
  for (const m of part.matchAll(tagRe)) {
    const [, closing, tag, attrs] = m
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
        const same = parts.find((p) => p.el === g.el)
        if (same) same.i.push(...idx)
        else parts.push({ el: g.el, i: idx })
      }
      depth--
    } else if (tag === 'path' && inStrokes) {
      const d = attr('d')
      if (d) strokes.push(compactPath(d))
    }
  }
  return { s: strokes, p: parts }
}
