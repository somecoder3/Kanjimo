import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { parts, strokePaths } from '../data/strokes'
import { pathToPolyline } from '../lib/geometry'

export const PART_COLORS = ['#e0533d', '#3d8fe0', '#2f9d62', '#e59a12', '#9b5de5', '#e05396']

interface Props {
  char: string
  /** Strichfolge animiert abspielen */
  animate?: boolean
  /** Ändern, um die Animation neu zu starten */
  playKey?: number
  speed?: number
  showNumbers?: boolean
  /** Bausteine farbig hervorheben */
  colorParts?: boolean
  /** Kleiner Tintentropfen (Mo) als Pinselspitze */
  withDrop?: boolean
  /** Blasser Umriss des ganzen Zeichens unter der Animation */
  ghost?: boolean
  strokeWidth?: number
  className?: string
  onDone?: () => void
  onStroke?: (i: number) => void
  label?: string
}

/** Zeichnet ein Kanji aus KanjiVG-Strichen – statisch oder als Strichfolge-Animation. */
export function KanjiStrokes({
  char,
  animate = false,
  playKey = 0,
  speed = 1,
  showNumbers = false,
  colorParts = false,
  withDrop = false,
  ghost = false,
  strokeWidth = 4.2,
  className = '',
  onDone,
  onStroke,
  label,
}: Props) {
  const paths = strokePaths(char)
  const refs = useRef<(SVGPathElement | null)[]>([])
  const dropRef = useRef<SVGGElement | null>(null)
  const [drawn, setDrawn] = useState(animate ? 0 : paths.length)
  const doneRef = useRef(onDone)
  const strokeRef = useRef(onStroke)
  doneRef.current = onDone
  strokeRef.current = onStroke

  const colorOf = useMemo(() => {
    const map: Record<number, string> = {}
    if (colorParts) parts(char).forEach((p, pi) => p.i.forEach((i) => (map[i] = PART_COLORS[pi % PART_COLORS.length])))
    return map
  }, [char, colorParts])

  const numberPos = useMemo(
    () =>
      paths.map((d) => {
        const pts = pathToPolyline(d, 4)
        const a = pts[0]
        const b = pts[Math.min(3, pts.length - 1)]
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
        // Nummer etwas entgegen der Strichrichtung versetzen
        return { x: a.x - ((b.x - a.x) / len) * 5 - 2, y: a.y - ((b.y - a.y) / len) * 5 + 2 }
      }),
    [paths],
  )

  useLayoutEffect(() => {
    if (!animate) {
      setDrawn(paths.length)
      refs.current.forEach((p) => {
        if (p) {
          p.style.strokeDasharray = ''
          p.style.strokeDashoffset = ''
        }
      })
      return
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const els = refs.current.slice(0, paths.length)
    const lens = els.map((p) => (p ? p.getTotalLength() : 0))
    els.forEach((p, i) => {
      if (!p) return
      p.style.strokeDasharray = `${lens[i]} ${lens[i]}`
      p.style.strokeDashoffset = `${lens[i]}`
    })
    setDrawn(0)
    let raf = 0
    let cancelled = false
    const durs = lens.map((l) => (reduce ? 60 : (260 + l * 7) / speed))
    const gap = reduce ? 20 : 160 / speed
    let idx = 0
    let start = performance.now() + (reduce ? 0 : 350)
    const drop = dropRef.current
    const step = (t: number) => {
      if (cancelled) return
      if (idx >= els.length) {
        if (drop) drop.style.opacity = '0'
        setDrawn(els.length)
        doneRef.current?.()
        return
      }
      const el = els[idx]
      const k = Math.min(1, Math.max(0, (t - start) / durs[idx]))
      // sanftes Ein-/Ausschwingen wie ein Pinsel
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
      if (el) {
        el.style.strokeDashoffset = `${lens[idx] * (1 - e)}`
        if (drop && withDrop) {
          const pt = el.getPointAtLength(lens[idx] * e)
          drop.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
          drop.style.opacity = t < start ? '0.0' : '1'
        }
      }
      if (k >= 1) {
        strokeRef.current?.(idx)
        idx++
        setDrawn(idx)
        start = t + gap
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [char, animate, playKey, speed, withDrop])

  return (
    <svg className={`kanji-svg ${className}`} viewBox="0 0 109 109" role="img" aria-label={label ?? char}>
      {ghost &&
        paths.map((d, i) => <path key={`g${i}`} d={d} stroke="var(--ghost)" strokeWidth={strokeWidth} opacity={0.7} />)}
      {paths.map((d, i) => (
        <path
          key={`${char}-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          d={d}
          stroke={colorOf[i] ?? 'var(--stroke-ink)'}
          strokeWidth={strokeWidth}
        />
      ))}
      {showNumbers &&
        numberPos.map((p, i) =>
          i < drawn || !animate ? (
            <text key={`n${i}`} className="stroke-num" x={p.x} y={p.y} textAnchor="middle">
              {i + 1}
            </text>
          ) : null,
        )}
      {withDrop && animate && (
        <g ref={dropRef} style={{ opacity: 0, transition: 'opacity .15s' }}>
          <path d="M0 -7.5 C 1 -5, 5 -2, 5 1.5 A 5 5 0 0 1 -5 1.5 C -5 -2, -1 -5, 0 -7.5 Z" fill="var(--mo-mid)" />
          <circle cx="-1.8" cy="1" r="1.2" fill="#fff" />
          <circle cx="1.8" cy="1" r="1.2" fill="#fff" />
        </g>
      )}
    </svg>
  )
}
