export function shuffle<T>(arr: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample<T>(arr: readonly T[], n: number, rnd: () => number = Math.random): T[] {
  return shuffle(arr, rnd).slice(0, n)
}

/**
 * Zieht bis zu n Elemente ohne Zurücklegen; die Chance eines Elements ist proportional zu seinem Gewicht
 * (Efraimidis–Spirakis). Gewichte ≤ 0 werden wie ein winziges Gewicht behandelt, damit nichts ganz verschwindet.
 */
export function weightedSample<T>(arr: readonly T[], n: number, weight: (x: T) => number, rnd: () => number = Math.random): T[] {
  return arr
    .map((x) => ({ x, key: Math.pow(rnd(), 1 / Math.max(weight(x), 1e-6)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map((e) => e.x)
}

export function pick<T>(arr: readonly T[], rnd: () => number = Math.random): T {
  return arr[Math.floor(rnd() * arr.length)]
}
