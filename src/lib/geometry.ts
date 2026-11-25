/**
 * Geometrie für Pinselstriche: SVG-Pfade (KanjiVG nutzt nur M/C/c/S/s)
 * abtasten und Nutzerstriche mit Referenzstrichen vergleichen.
 */

export interface Pt {
  x: number
  y: number
}

type Seg = [Pt, Pt, Pt, Pt]

/** Zerlegt einen KanjiVG-Pfad in kubische Bézier-Segmente. */
export function parsePath(d: string): Seg[] {
  const tokens = d.match(/[MmCcSsLl]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  const segs: Seg[] = []
  let i = 0
  let cmd = ''
  let cur: Pt = { x: 0, y: 0 }
  let lastCtrl: Pt | null = null
  const num = () => parseFloat(tokens[i++])
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++]
    switch (cmd) {
      case 'M':
        cur = { x: num(), y: num() }
        lastCtrl = null
        cmd = 'L'
        break
      case 'm':
        cur = { x: cur.x + num(), y: cur.y + num() }
        lastCtrl = null
        cmd = 'l'
        break
      case 'L':
      case 'l': {
        const rel = cmd === 'l'
        const x = num()
        const y = num()
        const p = rel ? { x: cur.x + x, y: cur.y + y } : { x, y }
        segs.push([cur, cur, p, p])
        cur = p
        lastCtrl = null
        break
      }
      case 'C':
      case 'c': {
        const rel = cmd === 'c'
        const o = rel ? cur : { x: 0, y: 0 }
        const c1 = { x: o.x + num(), y: o.y + num() }
        const c2 = { x: o.x + num(), y: o.y + num() }
        const p = { x: o.x + num(), y: o.y + num() }
        segs.push([cur, c1, c2, p])
        lastCtrl = c2
        cur = p
        break
      }
      case 'S':
      case 's': {
        const rel = cmd === 's'
        const o = rel ? cur : { x: 0, y: 0 }
        const c1 = lastCtrl ? { x: 2 * cur.x - lastCtrl.x, y: 2 * cur.y - lastCtrl.y } : cur
        const c2 = { x: o.x + num(), y: o.y + num() }
        const p = { x: o.x + num(), y: o.y + num() }
        segs.push([cur, c1, c2, p])
        lastCtrl = c2
        cur = p
        break
      }
      default:
        i++ // unbekanntes Token überspringen
    }
  }
  return segs
}

function bez([p0, p1, p2, p3]: Seg, t: number): Pt {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y }
}

/** Dichte Polylinie eines Pfads. */
export function pathToPolyline(d: string, stepsPerSeg = 16): Pt[] {
  const segs = parsePath(d)
  const pts: Pt[] = []
  segs.forEach((s, si) => {
    for (let k = si === 0 ? 0 : 1; k <= stepsPerSeg; k++) pts.push(bez(s, k / stepsPerSeg))
  })
  return pts
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

export function polylineLength(pts: Pt[]): number {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i])
  return l
}

/** Tastet eine Polylinie gleichmäßig nach Bogenlänge auf n Punkte ab. */
export function resample(pts: Pt[], n = 32): Pt[] {
  if (pts.length === 0) return []
  if (pts.length === 1) return Array.from({ length: n }, () => ({ ...pts[0] }))
  const total = polylineLength(pts)
  if (total === 0) return Array.from({ length: n }, () => ({ ...pts[0] }))
  const step = total / (n - 1)
  const out: Pt[] = [{ ...pts[0] }]
  let acc = 0
  let prev = pts[0]
  let i = 1
  while (i < pts.length && out.length < n) {
    const cur = pts[i]
    const d = dist(prev, cur)
    if (acc + d >= step && d > 0) {
      const t = (step - acc) / d
      const q = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) }
      out.push(q)
      prev = q
      acc = 0
    } else {
      acc += d
      prev = cur
      i++
    }
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] })
  return out
}

function meanDist(a: Pt[], b: Pt[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += dist(a[i], b[i])
  return s / a.length
}

export type StrokeVerdict = 'ok' | 'reversed' | 'order' | 'miss'

export interface MatchResult {
  verdict: StrokeVerdict
  /** Mittlere Abweichung in KanjiVG-Einheiten (0–109) */
  score: number
  /** Bei 'order': Index des Strichs, der eigentlich gezeichnet wurde */
  matchedIndex?: number
}

export interface MatchOptions {
  /** Toleranz-Faktor, 1 = Standard, größer = nachsichtiger */
  leniency?: number
}

const N = 32

/** Vergleicht einen gezeichneten Strich (in 109er-Koordinaten) mit einem Referenzstrich. */
export function strokeDistance(user: Pt[], ref: Pt[]) {
  const u = resample(user, N)
  const r = resample(ref, N)
  const fwd = meanDist(u, r)
  const rev = meanDist([...u].reverse(), r)
  // Länge auf geglätteter Linie messen, damit Zittern kurze Striche nicht „verlängert“
  const lenU = polylineLength(resample(user, 8))
  const lenR = polylineLength(r)
  return { fwd, rev, lenU, lenR, start: dist(u[0], r[0]), end: dist(u[N - 1], r[N - 1]) }
}

function threshold(lenR: number, leniency: number) {
  // Kurze Striche (Punkte) etwas strenger in absoluten Einheiten, lange großzügiger.
  return (11 + Math.min(lenR, 90) * 0.06) * leniency
}

function isMatch(m: ReturnType<typeof strokeDistance>, leniency: number) {
  const th = threshold(m.lenR, leniency)
  const ratio = m.lenU / Math.max(m.lenR, 1)
  // Kurze Punkte dürfen großzügig „überzeichnet“ werden
  const tooLong = ratio >= 2.4 && m.lenU > 24
  return m.fwd < th && m.start < th * 1.7 && m.end < th * 1.7 && ratio > 0.4 && !tooLong
}

/**
 * Prüft den Strich gegen den erwarteten Strich und gibt eine Diagnose zurück.
 * @param refs alle Referenzstriche als Polylinien
 * @param expected Index des erwarteten Strichs
 */
export function matchStroke(user: Pt[], refs: Pt[][], expected: number, opts: MatchOptions = {}): MatchResult {
  const leniency = opts.leniency ?? 1
  if (user.length < 2 || polylineLength(user) < 2.5) {
    // Antippen zählt nur bei sehr kurzen Referenzstrichen (Punkte)
    const lenR = polylineLength(refs[expected])
    if (lenR < 12 && user.length > 0) {
      const r = resample(refs[expected], N)
      const mid = r[Math.floor(N / 2)]
      const d = dist(user[0], mid)
      if (d < 12 * leniency) return { verdict: 'ok', score: d }
    }
    return { verdict: 'miss', score: Infinity }
  }
  const m = strokeDistance(user, refs[expected])
  if (isMatch(m, leniency)) {
    // Liegt der Strich deutlich näher an einem anderen Strich des Zeichens, war dieser gemeint.
    let nearest = -1
    let nearestD = m.fwd * 0.75
    for (let k = 0; k < refs.length; k++) {
      if (k === expected) continue
      const d = strokeDistance(user, refs[k]).fwd
      if (d < nearestD) {
        nearestD = d
        nearest = k
      }
    }
    if (nearest === -1) return { verdict: 'ok', score: m.fwd }
    if (nearest > expected) return { verdict: 'order', score: nearestD, matchedIndex: nearest }
    return { verdict: 'miss', score: m.fwd }
  }
  // Falsche Richtung?
  const th = threshold(m.lenR, leniency)
  if (m.rev < th && m.rev < m.fwd) return { verdict: 'reversed', score: m.rev }
  // Ein späterer Strich gezeichnet?
  for (let k = expected + 1; k < refs.length; k++) {
    const mk = strokeDistance(user, refs[k])
    if (isMatch(mk, leniency * 0.9)) return { verdict: 'order', score: mk.fwd, matchedIndex: k }
  }
  return { verdict: 'miss', score: m.fwd }
}
