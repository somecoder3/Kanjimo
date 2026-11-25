/**
 * Lädt die JLPT-Stufen N4–N1 nach. Die Daten liegen als eigene Dateien vor und
 * werden vom Service Worker für den Offline-Betrieb vorgehalten.
 *
 * Quellen: KANJIDIC2 & JMdict (EDRDG, CC BY-SA 4.0), JLPT-Listen von Jonathan Waller (CC BY),
 * KanjiVG (CC BY-SA 3.0). Deutsche Bedeutungen, Eselsbrücken und Übersetzungen: Kanjimo.
 */
import { registerLevel, type KanjiEntry } from './kanji'
import { registerStrokes, type StrokeData } from './strokes'

type Json<T> = { default: T }

const DATA: Record<number, () => Promise<Json<KanjiEntry[]>>> = {
  4: () => import('./levels/n4.json') as Promise<Json<KanjiEntry[]>>,
  3: () => import('./levels/n3.json') as Promise<Json<KanjiEntry[]>>,
  2: () => import('./levels/n2.json') as Promise<Json<KanjiEntry[]>>,
  1: () => import('./levels/n1.json') as Promise<Json<KanjiEntry[]>>,
}

const STROKES: Record<number, () => Promise<Json<Record<string, StrokeData>>>> = {
  4: () => import('./strokes/n4.json') as Promise<Json<Record<string, StrokeData>>>,
  3: () => import('./strokes/n3.json') as Promise<Json<Record<string, StrokeData>>>,
  2: () => import('./strokes/n2.json') as Promise<Json<Record<string, StrokeData>>>,
  1: () => import('./strokes/n1.json') as Promise<Json<Record<string, StrokeData>>>,
}

let loading: Promise<void> | null = null

/** Lädt alle Stufen (in fester Reihenfolge, damit Einheiten-IDs stabil bleiben). */
export function loadAllLevels(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      const levels = [4, 3, 2, 1]
      const [data, strokes] = await Promise.all([Promise.all(levels.map((l) => DATA[l]())), Promise.all(levels.map((l) => STROKES[l]()))])
      levels.forEach((l, i) => {
        registerStrokes(strokes[i].default)
        registerLevel(l, data[i].default)
      })
    })()
  }
  return loading
}
