import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconBack, IconClose, IconSpeaker } from './Icons'
import { back } from '../lib/router'
import { canSpeak, hasJapaneseVoice, speak } from '../lib/speech'
import { emit } from '../lib/events'
import { sfx } from '../lib/feedback'

/* ───────── Kopfzeile ───────── */
export function TopBar({ title, onBack, right, close }: { title?: ReactNode; onBack?: () => void; right?: ReactNode; close?: boolean }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onBack ?? (() => back())} aria-label={close ? 'Schließen' : 'Zurück'}>
        {close ? <IconClose /> : <IconBack />}
      </button>
      <div className="subtitle" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </div>
      {right}
    </header>
  )
}

/* ───────── Bottom-Sheet ───────── */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/** Bestätigungsdialog als Bottom-Sheet. */
export function Confirm({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel = 'Abbrechen',
  danger = false,
  onConfirm,
  onCancel,
  art,
}: {
  open: boolean
  title: string
  text?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  art?: ReactNode
}) {
  return (
    <Sheet open={open} onClose={onCancel} label={title}>
      <div className="stack center" style={{ alignItems: 'center', gap: 14 }}>
        {art}
        <h2 className="title" style={{ fontSize: '1.35rem' }}>
          {title}
        </h2>
        {text && <p className="muted">{text}</p>}
        <div className="stack" style={{ width: '100%', marginTop: 6 }}>
          <button className="btn block" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`link-btn ${danger ? 'danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

/* ───────── Fortschrittsring ───────── */
export function Ring({ value, size = 64, stroke = 8, color = 'var(--matcha)', track = 'var(--line)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  )
}

/* ───────── Vorlesen ───────── */
export function SpeakButton({ text, label = 'Vorlesen', small = false }: { text: string; label?: string; small?: boolean }) {
  const [active, setActive] = useState(false)
  if (!canSpeak()) return null
  return (
    <button
      className={`speak-btn ${small ? 'small' : ''} ${active ? 'active' : ''}`}
      aria-label={`${label}: ${text}`}
      onClick={(e) => {
        e.stopPropagation()
        const ok = speak(text)
        if (!ok || !hasJapaneseVoice()) {
          emit({ type: 'toast', icon: '🔇', text: 'Auf diesem Gerät ist keine japanische Stimme installiert.' })
          return
        }
        setActive(true)
        setTimeout(() => setActive(false), 900)
      }}
    >
      <IconSpeaker />
    </button>
  )
}

/* ───────── Lesungen ───────── */
export function Reading({ r }: { r: string }) {
  // "た.べる" → Stamm fett, Okurigana blass; "-び" Bindestrich blass
  const [stem, oku] = r.split('.')
  return (
    <span className="reading">
      {stem.split(/(-)/).map((s, i) =>
        s === '-' ? (
          <span key={i} className="oku">
            ～
          </span>
        ) : (
          <span key={i}>{s}</span>
        ),
      )}
      {oku && <span className="oku">{oku}</span>}
    </span>
  )
}

/* ───────── Konfetti / Tintenspritzer ───────── */
export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!fire) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = innerWidth * dpr
    c.height = innerHeight * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    const colors = ['#e0533d', '#f0a82a', '#2f9d62', '#4248b5', '#ff7fa0', '#3d9be0']
    const parts = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: innerHeight * 0.38,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 13 - 5,
      r: Math.random() * 5 + 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.35 ? 'petal' : Math.random() < 0.5 ? 'drop' : 'rect',
    }))
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const el = t - t0
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      for (const p of parts) {
        p.vy += 0.32
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - el / 2600)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        else if (p.shape === 'petal') {
          ctx.beginPath()
          ctx.ellipse(0, 0, p.r * 1.1, p.r * 0.6, 0, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (el < 2700) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, innerWidth, innerHeight)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fire])
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}

/* ───────── Kleine Helfer ───────── */
export function Stars({ n, size = 28 }: { n: number; size?: number }) {
  return (
    <div className="stars" aria-label={`${n} von 3 Sternen`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} className={i < n ? 'on' : ''} style={{ animationDelay: `${0.25 + i * 0.22}s` }}>
          <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
        </svg>
      ))}
    </div>
  )
}

export function useTapSound() {
  return () => sfx.tap()
}
