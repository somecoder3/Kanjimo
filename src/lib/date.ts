/** Lokaler Tagesschlüssel im Format YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12) // Mittag: robust gegen Sommerzeitwechsel
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

/** Anzahl Kalendertage von a nach b (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000)
}

export function timeOfDay(d: Date = new Date()): 'morning' | 'day' | 'evening' | 'night' {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 18) return 'day'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export function weekdayShort(key: string): string {
  return WD[parseDay(key).getDay()]
}

export function formatRelative(target: Date, now: Date = new Date()): string {
  const ms = target.getTime() - now.getTime()
  if (ms <= 0) return 'jetzt'
  const min = Math.round(ms / 60_000)
  if (min < 60) return `in ${min} Min.`
  const h = Math.round(min / 60)
  if (h < 24) return `in ${h} Std.`
  const d = Math.round(h / 24)
  if (d === 1) return 'morgen'
  if (d < 30) return `in ${d} Tagen`
  const mo = Math.round(d / 30)
  return mo === 1 ? 'in einem Monat' : `in ${mo} Monaten`
}
