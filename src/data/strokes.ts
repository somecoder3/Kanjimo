/**
 * Strichdaten aus KanjiVG (https://kanjivg.tagaini.net)
 * © Ulrich Apel – lizenziert unter CC BY-SA 3.0.
 */
import raw from './strokes.json'
import { pathToPolyline, type Pt } from '../lib/geometry'

export interface Part {
  el: string
  i: number[]
}
export interface StrokeData {
  s: string[]
  p: Part[]
}

const DATA = { ...(raw as Record<string, StrokeData>) }

/** Strichdaten einer weiteren Stufe hinzufügen. */
export function registerStrokes(data: Record<string, StrokeData>) {
  Object.assign(DATA, data)
}

export function strokePaths(c: string): string[] {
  return DATA[c]?.s ?? []
}

export function strokeCount(c: string): number {
  return DATA[c]?.s.length ?? 0
}

export function parts(c: string): Part[] {
  return DATA[c]?.p ?? []
}

const polyCache = new Map<string, Pt[][]>()
export function strokePolylines(c: string): Pt[][] {
  let p = polyCache.get(c)
  if (!p) {
    p = strokePaths(c).map((d) => pathToPolyline(d))
    polyCache.set(c, p)
  }
  return p
}

export function hasStrokes(c: string): boolean {
  return c in DATA
}
