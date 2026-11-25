/**
 * Spaced Repetition mit FSRS (Free Spaced Repetition Scheduler) über ts-fsrs.
 * Karten werden JSON-tauglich gespeichert (Datumsangaben als ISO-Strings).
 */
import { DefaultScheduler, Rating } from 'ts-fsrs'

type Scheduler = Awaited<ReturnType<typeof DefaultScheduler>>
type Card = Parameters<Scheduler['review']>[0]['card']

export type Grade = 1 | 2 | 3 | 4
export const GRADE = { again: Rating.Again as Grade, hard: Rating.Hard as Grade, good: Rating.Good as Grade, easy: Rating.Easy as Grade }

/** Gespeicherte Karte – Datumsfelder als ISO-String. */
export type StoredCard = Record<string, unknown> & { dueAt: string; lastReviewAt: string | null; reps: number; lapses: number; stability: number }

let scheduler: Scheduler | null = null

export async function initSrs(): Promise<void> {
  if (scheduler) return
  scheduler = await DefaultScheduler({
    desiredRetention: 0.9,
    enableFuzz: true,
    learningSteps: ['10m', '1d'],
    relearningSteps: ['10m'],
    allowModelOverride: false,
    maximumInterval: 365,
  })
}

function s(): Scheduler {
  if (!scheduler) throw new Error('SRS nicht initialisiert')
  return scheduler
}

function toStored(card: object): StoredCard {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(card)) out[k] = v instanceof Date ? v.toISOString() : v
  return out as StoredCard
}

function fromStored(card: StoredCard): Card {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(card)) {
    out[k] = k.endsWith('At') && typeof v === 'string' ? new Date(v) : v
  }
  return out as unknown as Card
}

export function newCard(now: Date = new Date()): StoredCard {
  return toStored(s().newCard({ now }))
}

export function review(card: StoredCard, grade: Grade, now: Date = new Date()): StoredCard {
  return toStored(s().review({ card: fromStored(card) as never, grade, now }).card)
}

export function isDue(card: StoredCard, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime()
}

/** Geschätzte Abrufwahrscheinlichkeit 0–1. */
export function retrievability(card: StoredCard, now: Date = new Date()): number {
  if (!card.lastReviewAt) return 0
  const sch = s()
  const c = fromStored(card)
  const elapsed = sch.chrono.difference(new Date(card.lastReviewAt), now)
  const r = sch.model.forgettingCurve(c as never, Math.max(0, elapsed))
  return Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : 0
}

export type Mastery = 0 | 1 | 2 | 3 | 4
/** Beherrschungsstufe für Farben/Abzeichen: 0 neu … 4 gemeistert. */
export function mastery(card: StoredCard | undefined): Mastery {
  if (!card) return 0
  const st = card.stability
  if (st >= 60) return 4
  if (st >= 14) return 3
  if (st >= 3) return 2
  return 1
}

export const MASTERY_LABEL = ['Neu', 'Gesät', 'Sprießt', 'Wächst', 'Gemeistert'] as const
