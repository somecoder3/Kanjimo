import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { strokePaths, strokePolylines } from '../data/strokes'
import { matchStroke, type Pt, type StrokeVerdict } from '../lib/geometry'
import { buzz, sfx } from '../lib/feedback'

export interface WriteResult {
  mistakes: number
  hints: number
  ms: number
}

interface Props {
  char: string
  /** trace = Vorlage sichtbar, free = aus dem Gedächtnis */
  mode: 'trace' | 'free'
  onComplete: (r: WriteResult) => void
  /** Rückmeldung pro Strich, z. B. für Mo-Reaktionen */
  onFeedback?: (v: StrokeVerdict, strokeIndex: number) => void
  /** Von außen ausgelöster Hinweis (Zähler erhöhen) */
  hintKey?: number
  showNumbers?: boolean
  disabled?: boolean
}

const INK_W = 5.2 // Strichbreite in KanjiVG-Einheiten für die Live-Tinte

export function WritingPad({ char, mode, onComplete, onFeedback, hintKey = 0, showNumbers = false, disabled = false }: Props) {
  const paths = strokePaths(char)
  const refs = strokePolylines(char)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [index, setIndex] = useState(0)
  const [misses, setMisses] = useState(0)
  const [hintShown, setHintShown] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(0)
  const [done, setDone] = useState(false)
  const stats = useRef({ mistakes: 0, hints: 0, start: performance.now() })
  const pointer = useRef<{ id: number; pts: Pt[]; rect: DOMRect; last: { x: number; y: number; t: number; w: number } } | null>(null)

  // Zurücksetzen bei neuem Zeichen oder Modus
  useEffect(() => {
    setIndex(0)
    setMisses(0)
    setHintShown(false)
    setDone(false)
    stats.current = { mistakes: 0, hints: 0, start: performance.now() }
    clearCanvas()
  }, [char, mode])

  // Hinweis von außen
  useEffect(() => {
    if (hintKey > 0 && !done) {
      setHintShown(true)
      stats.current.hints++
    }
  }, [hintKey, done])

  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current
    const w = wrapRef.current
    if (!c || !w) return
    const r = w.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    c.width = Math.round(r.width * dpr)
    c.height = Math.round(r.height * dpr)
    const ctx = c.getContext('2d')
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [])

  useLayoutEffect(() => {
    sizeCanvas()
    const ro = new ResizeObserver(sizeCanvas)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [sizeCanvas])

  function clearCanvas() {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.restore()
    c.style.transition = 'none'
    c.style.opacity = '1'
  }

  function inkColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--stroke-ink').trim() || '#1d1f3f'
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled || done || pointer.current) return
    e.preventDefault()
    const c = canvasRef.current!
    try {
      c.setPointerCapture(e.pointerId)
    } catch {
      /* Capture nicht möglich – Zeichnen funktioniert trotzdem */
    }
    clearCanvas()
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scale = rect.width / 109
    pointer.current = { id: e.pointerId, pts: [{ x: (x / rect.width) * 109, y: (y / rect.height) * 109 }], rect, last: { x, y, t: e.timeStamp, w: INK_W * scale } }
    const ctx = c.getContext('2d')!
    ctx.fillStyle = inkColor()
    ctx.beginPath()
    ctx.arc(x, y, (INK_W * scale) / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const p = pointer.current
    if (!p || p.id !== e.pointerId) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent]
    const scale = p.rect.width / 109
    ctx.strokeStyle = inkColor()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const x = ev.clientX - p.rect.left
      const y = ev.clientY - p.rect.top
      const dt = Math.max(1, ev.timeStamp - p.last.t)
      const v = Math.hypot(x - p.last.x, y - p.last.y) / dt // px/ms
      // Pinsel: schnell = dünner, langsam = satter
      const target = INK_W * scale * Math.max(0.55, Math.min(1.15, 1.15 - v * 0.35))
      const w = p.last.w * 0.7 + target * 0.3
      ctx.lineWidth = w
      ctx.beginPath()
      ctx.moveTo(p.last.x, p.last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      p.last = { x, y, t: ev.timeStamp, w }
      p.pts.push({ x: (x / p.rect.width) * 109, y: (y / p.rect.height) * 109 })
    }
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const p = pointer.current
    if (!p || p.id !== e.pointerId) return
    pointer.current = null
    evaluate(p.pts)
  }

  function onCancel() {
    pointer.current = null
    clearCanvas()
  }

  function fadeWrong() {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    // Nutzerstrich rot einfärben und ausblenden
    ctx.save()
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--hanko').trim() || '#e0533d'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.restore()
    requestAnimationFrame(() => {
      c.style.transition = 'opacity .6s ease .25s'
      c.style.opacity = '0'
    })
    setTimeout(() => {
      if (!pointer.current) clearCanvas()
    }, 900)
  }

  function evaluate(pts: Pt[]) {
    const leniency = (mode === 'trace' ? 1.1 : 1.3) + Math.min(misses, 3) * 0.15
    const res = matchStroke(pts, refs, index, { leniency })
    if (res.verdict === 'ok') {
      clearCanvas()
      sfx.strokeOk()
      buzz.light()
      const next = index + 1
      setIndex(next)
      setMisses(0)
      setHintShown(false)
      onFeedback?.('ok', index)
      if (next >= paths.length) {
        setDone(true)
        setTimeout(
          () =>
            onComplete({
              mistakes: stats.current.mistakes,
              hints: stats.current.hints,
              ms: performance.now() - stats.current.start,
            }),
          650,
        )
      }
    } else {
      stats.current.mistakes++
      sfx.wrong()
      buzz.bad()
      fadeWrong()
      setWrongFlash((n) => n + 1)
      const m = misses + 1
      setMisses(m)
      if (m >= 2 && !hintShown) {
        setHintShown(true)
        stats.current.hints++
      }
      onFeedback?.(res.verdict, index)
    }
  }

  const showGhost = mode === 'trace'
  const nextVisible = !done && (showGhost || hintShown)
  const startPt = !done && index < refs.length ? refs[index][0] : null
  const secondPt = !done && index < refs.length ? refs[index][Math.min(6, refs[index].length - 1)] : null

  return (
    <div ref={wrapRef} className={`grid-paper writing-pad ${wrongFlash ? 'pad-wrong-' + (wrongFlash % 2) : ''} ${done ? 'pad-done' : ''}`}>
      <svg className="kanji-svg" viewBox="0 0 109 109" aria-hidden="true">
        {showGhost && paths.map((d, i) => <path key={`g${i}`} d={d} stroke="var(--ghost)" strokeWidth={4.6} />)}
        {nextVisible && index < paths.length && (
          <path className="hint-stroke" d={paths[index]} stroke="var(--hanko)" strokeWidth={4.6} opacity={0.55} />
        )}
        {paths.slice(0, index).map((d, i) => (
          <path key={`ok${i}`} className={i === index - 1 ? 'stroke-in' : ''} d={d} stroke="var(--stroke-ink)" strokeWidth={INK_W} pathLength={1} />
        ))}
        {showNumbers &&
          paths.slice(0, index).map((_, i) => (
            <text key={`n${i}`} className="stroke-num" x={refs[i][0].x - 3} y={refs[i][0].y + 2} textAnchor="middle">
              {i + 1}
            </text>
          ))}
        {nextVisible && startPt && secondPt && (
          <g className="start-dot">
            <circle cx={startPt.x} cy={startPt.y} r={3.6} fill="var(--hanko)" />
            <circle cx={startPt.x} cy={startPt.y} r={3.6} fill="none" stroke="var(--hanko)" strokeWidth={1.2} className="ping" />
          </g>
        )}
      </svg>
      <canvas
        ref={canvasRef}
        className="pad-canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        aria-label={`Schreibfläche für ${char}`}
      />
      <div className="pad-counter" aria-live="polite">
        {Math.min(index + (done ? 0 : 1), paths.length)} / {paths.length}
      </div>
    </div>
  )
}
