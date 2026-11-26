// Sicherung des Fortschritts als JSON-Datei – per Teilen-Menü (Drive, iCloud, Mail …) oder als Download.
import { dayKey, diffDays } from './date'
import { snapshot, useStore, type PersistedState } from './store'

export const BACKUP_REMIND_DAYS = 7

function backupFile(): File {
  const json = JSON.stringify({ app: 'kanjimo', exportedAt: new Date().toISOString(), data: snapshot() }, null, 2)
  return new File([json], `kanjimo-sicherung-${dayKey()}.json`, { type: 'application/json' })
}

/** Kann dieses Gerät Dateien über das System-Teilen-Menü weitergeben? */
export function canShareFiles(): boolean {
  try {
    if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
    const probe = new File(['{}'], 'probe.json', { type: 'application/json' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

export type BackupResult = 'shared' | 'downloaded' | 'cancelled' | 'failed'

/** Öffnet das Teilen-Menü mit der Sicherungsdatei. Ohne Teilen-Unterstützung wird sie heruntergeladen. */
export async function shareBackup(): Promise<BackupResult> {
  const file = backupFile()
  if (canShareFiles()) {
    try {
      await navigator.share({ files: [file], title: 'Kanjimo-Sicherung' })
      useStore.getState().markBackup()
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      // z. B. NotAllowedError ohne Nutzergeste → auf Download ausweichen
    }
  }
  return downloadBackup(file)
}

export function downloadBackup(file: File = backupFile()): BackupResult {
  try {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    useStore.getState().markBackup()
    return 'downloaded'
  } catch {
    return 'failed'
  }
}

/** Tage seit der letzten Sicherung, oder null, wenn noch nie gesichert wurde. */
export function daysSinceBackup(stats: PersistedState['stats'], today = dayKey()): number | null {
  if (!stats.lastBackup) return null
  return diffDays(dayKey(new Date(stats.lastBackup)), today)
}

/** Soll die Startseite an eine Sicherung erinnern? Erst wenn es etwas zu verlieren gibt. */
export function backupDue(s: Pick<PersistedState, 'stats' | 'progress' | 'createdAt'>, today = dayKey()): boolean {
  if (Object.keys(s.progress).length < 6) return false
  if (s.stats.backupSnoozeUntil && s.stats.backupSnoozeUntil > today) return false
  const since = daysSinceBackup(s.stats, today)
  if (since !== null) return since >= BACKUP_REMIND_DAYS
  return diffDays(dayKey(new Date(s.createdAt)), today) >= BACKUP_REMIND_DAYS
}

export function backupLabel(stats: PersistedState['stats'], today = dayKey()): string {
  const d = daysSinceBackup(stats, today)
  if (d === null) return 'Noch keine Sicherung erstellt.'
  if (d === 0) return 'Letzte Sicherung: heute.'
  if (d === 1) return 'Letzte Sicherung: gestern.'
  return `Letzte Sicherung: vor ${d} Tagen.`
}
