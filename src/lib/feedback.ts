/**
 * Sinnes-Feedback: synthetische Töne (Web Audio) und Haptik.
 * Alles optional und stumm, wenn in den Einstellungen deaktiviert.
 */
import { useStore } from './store'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (!useStore.getState().settings.sound) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, dur: number, opts: { type?: OscillatorType; gain?: number; slide?: number } = {}) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + start
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t0)
  if (opts.slide) osc.frequency.exponentialRampToValueAtTime(freq * opts.slide, t0 + dur)
  const peak = opts.gain ?? 0.12
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

function brush(start = 0, dur = 0.16, gain = 0.05) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + start
  const len = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.setValueAtTime(1800, t0)
  f.frequency.exponentialRampToValueAtTime(700, t0 + dur)
  f.Q.value = 0.8
  const g = a.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t0)
}

export const sfx = {
  tap: () => tone(660, 0, 0.06, { type: 'triangle', gain: 0.05 }),
  correct: () => {
    tone(784, 0, 0.12, { type: 'triangle', gain: 0.1 })
    tone(1175, 0.08, 0.22, { type: 'triangle', gain: 0.1 })
  },
  wrong: () => {
    tone(330, 0, 0.16, { type: 'sine', gain: 0.1, slide: 0.8 })
    tone(247, 0.1, 0.22, { type: 'sine', gain: 0.08, slide: 0.85 })
  },
  stroke: () => brush(0, 0.14, 0.06),
  strokeOk: () => {
    brush(0, 0.12, 0.05)
    tone(1046, 0.02, 0.1, { type: 'sine', gain: 0.05 })
  },
  complete: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', gain: 0.09 }))
  },
  fanfare: () => {
    ;[523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.18, { type: 'triangle', gain: 0.09 }))
    tone(1046, 0.32, 0.5, { type: 'triangle', gain: 0.11 })
    tone(1318, 0.32, 0.5, { type: 'sine', gain: 0.06 })
  },
  combo: (n: number) => tone(600 + Math.min(n, 20) * 40, 0, 0.09, { type: 'triangle', gain: 0.07 }),
  flip: () => tone(880, 0, 0.05, { type: 'sine', gain: 0.05, slide: 1.4 }),
  pop: () => tone(520, 0, 0.08, { type: 'sine', gain: 0.08, slide: 1.8 }),
  tick: () => tone(1200, 0, 0.03, { type: 'square', gain: 0.025 }),
}

export function haptic(pattern: number | number[] = 10) {
  if (!useStore.getState().settings.haptics) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* nicht unterstützt */
  }
}

export const buzz = {
  light: () => haptic(8),
  ok: () => haptic(14),
  bad: () => haptic([30, 40, 30]),
  win: () => haptic([12, 40, 12, 40, 30]),
}
