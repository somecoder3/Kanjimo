import { useEffect, useRef, useState } from 'react'
import { useStore, type Theme } from '../lib/store'
import { navigate } from '../lib/router'
import { GOALS } from '../lib/gamification'
import { emit } from '../lib/events'
import { backupLabel, canShareFiles, downloadBackup, shareBackup, type BackupResult } from '../lib/backup'
import { canSpeak, speak } from '../lib/speech'
import { sfx } from '../lib/feedback'
import { Confirm, TopBar } from '../components/ui'
import { Mo } from '../components/Mo'
import { IconChevron, IconDownload, IconInfo, IconShare, IconTrash, IconUpload } from '../components/Icons'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

let deferredPrompt: BIPEvent | null = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as BIPEvent
})

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      className="switch"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => {
        onChange(!on)
        sfx.tap()
      }}
    />
  )
}

export function Settings() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const resetAll = useStore((s) => s.resetAll)
  const importState = useStore((s) => s.importState)
  const stats = useStore((s) => s.stats)
  const [shareOk] = useState(canShareFiles)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingImport, setPendingImport] = useState<unknown>(null)
  const [canInstall, setCanInstall] = useState(!!deferredPrompt)
  const fileRef = useRef<HTMLInputElement>(null)
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const h = () => setCanInstall(true)
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const backupResult = (r: BackupResult) => {
    if (r === 'shared') emit({ type: 'toast', icon: '☁️', text: 'Sicherung weitergegeben.' })
    else if (r === 'downloaded') emit({ type: 'toast', icon: '💾', text: 'Sicherung gespeichert.' })
    else if (r === 'failed') emit({ type: 'toast', icon: '⚠️', text: 'Sicherung konnte nicht erstellt werden.' })
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      const json = JSON.parse(await f.text())
      const data = json?.app === 'kanjimo' ? json.data : json
      if (!data || typeof data !== 'object' || !('progress' in data)) throw new Error('kein Kanjimo-Format')
      setPendingImport(data)
    } catch {
      emit({ type: 'toast', icon: '⚠️', text: 'Diese Datei ist keine gültige Kanjimo-Sicherung.' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <main className="screen full settings">
      <TopBar title="Einstellungen" />

      <h2 className="section-title">Lernen</h2>
      <div className="card">
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="s-label">
            Tagesziel
            <span className="s-hint">Wie viele XP möchtest du täglich sammeln?</span>
          </span>
          <div className="segmented" role="group" aria-label="Tagesziel">
            {GOALS.map((g) => (
              <button key={g.xp} aria-pressed={settings.dailyGoal === g.xp} onClick={() => update({ dailyGoal: g.xp })}>
                {g.emoji} {g.xp}
              </button>
            ))}
          </div>
        </div>
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="s-label">
            Karten pro Wiederholung
            <span className="s-hint">Höchstens so viele fällige Kanji pro Runde.</span>
          </span>
          <div className="segmented" role="group" aria-label="Karten pro Wiederholung">
            {[10, 20, 30, 50].map((n) => (
              <button key={n} aria-pressed={settings.reviewBatch === n} onClick={() => update({ reviewBatch: n })}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <span className="s-label">
            Schreibaufgaben in Wiederholungen
            <span className="s-hint">Kanji aus dem Gedächtnis schreiben – der beste Merkeffekt.</span>
          </span>
          <Switch on={settings.writingInReviews} onChange={(v) => update({ writingInReviews: v })} label="Schreibaufgaben" />
        </div>
        <div className="setting">
          <span className="s-label">
            Strichnummern anzeigen
            <span className="s-hint">Nummern beim Schreiben einblenden.</span>
          </span>
          <Switch on={settings.strokeNumbers} onChange={(v) => update({ strokeNumbers: v })} label="Strichnummern" />
        </div>
      </div>

      <h2 className="section-title">Ton & Gefühl</h2>
      <div className="card">
        <div className="setting">
          <span className="s-label">Töne</span>
          <Switch on={settings.sound} onChange={(v) => update({ sound: v })} label="Töne" />
        </div>
        <div className="setting">
          <span className="s-label">
            Vibration
            <span className="s-hint">Haptisches Feedback (Android).</span>
          </span>
          <Switch on={settings.haptics} onChange={(v) => update({ haptics: v })} label="Vibration" />
        </div>
        {canSpeak() && (
          <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <span className="s-label">Vorlesetempo</span>
            <div className="segmented" role="group" aria-label="Vorlesetempo">
              {[
                [0.65, 'Langsam'],
                [0.85, 'Normal'],
                [1.05, 'Schnell'],
              ].map(([r, l]) => (
                <button
                  key={r}
                  aria-pressed={settings.speechRate === r}
                  onClick={() => {
                    update({ speechRate: r as number })
                    setTimeout(() => speak('こんにちは'), 50)
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <h2 className="section-title">Darstellung</h2>
      <div className="card">
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="s-label">Design</span>
          <div className="segmented" role="group" aria-label="Design">
            {(
              [
                ['auto', 'Automatisch'],
                ['light', 'Hell'],
                ['dark', 'Dunkel'],
              ] as [Theme, string][]
            ).map(([t, l]) => (
              <button key={t} aria-pressed={settings.theme === t} onClick={() => update({ theme: t })}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!standalone && (canInstall || isIOS) && (
        <>
          <h2 className="section-title">App</h2>
          <div className="card">
            {canInstall ? (
              <div className="setting">
                <span className="s-label">
                  Kanjimo installieren
                  <span className="s-hint">Als App auf den Startbildschirm – funktioniert auch offline.</span>
                </span>
                <button
                  className="btn small-btn"
                  style={{ marginBottom: 0 }}
                  onClick={async () => {
                    if (!deferredPrompt) return
                    await deferredPrompt.prompt()
                    await deferredPrompt.userChoice
                    deferredPrompt = null
                    setCanInstall(false)
                  }}
                >
                  Installieren
                </button>
              </div>
            ) : (
              <div className="setting">
                <span className="s-label">
                  Zum Home-Bildschirm hinzufügen
                  <span className="s-hint">Tippe in Safari auf „Teilen“ und dann auf „Zum Home-Bildschirm“.</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="section-title">Daten</h2>
      <div className="card">
        {shareOk && (
          <button className="setting setting-btn" onClick={async () => backupResult(await shareBackup())}>
            <IconShare width={22} height={22} />
            <span className="s-label">
              Sicherung teilen
              <span className="s-hint">Z. B. „In Drive speichern“, iCloud Drive oder per Mail. {backupLabel(stats)}</span>
            </span>
          </button>
        )}
        <button className="setting setting-btn" onClick={() => backupResult(downloadBackup())}>
          <IconDownload width={22} height={22} />
          <span className="s-label">
            {shareOk ? 'Als Datei speichern' : 'Sicherung exportieren'}
            <span className="s-hint">
              {shareOk ? 'Sicherungsdatei auf dieses Gerät herunterladen.' : `Dein Fortschritt liegt nur auf diesem Gerät. ${backupLabel(stats)}`}
            </span>
          </span>
        </button>
        <button className="setting setting-btn" onClick={() => fileRef.current?.click()}>
          <IconUpload width={22} height={22} />
          <span className="s-label">Sicherung importieren</span>
        </button>
        <input ref={fileRef} type="file" accept="application/json,text/plain,.json,.txt" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button className="setting setting-btn danger" onClick={() => setConfirmReset(true)}>
          <IconTrash width={22} height={22} />
          <span className="s-label">Fortschritt zurücksetzen</span>
        </button>
      </div>

      <h2 className="section-title">Info</h2>
      <div className="card">
        <button className="setting setting-btn" onClick={() => navigate('/ueber')}>
          <IconInfo width={22} height={22} />
          <span className="s-label">Über Kanjimo & Lizenzen</span>
          <IconChevron width={18} height={18} />
        </button>
      </div>
      <p className="tiny faint center" style={{ marginTop: 16 }}>
        Kanjimo {__APP_VERSION__}
      </p>

      <Confirm
        open={confirmReset}
        art={<Mo mood="sad" size={90} />}
        title="Alles zurücksetzen?"
        text="Alle Kanji, deine Serie, XP und Erfolge werden gelöscht. Das kann nicht rückgängig gemacht werden. Tipp: Exportiere vorher eine Sicherung."
        cancelLabel="Lieber nicht"
        confirmLabel="Ja, alles löschen"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          resetAll()
          navigate('/', { replace: true })
        }}
      />
      <Confirm
        open={pendingImport !== null}
        art={<Mo mood="think" size={90} />}
        title="Sicherung importieren?"
        text="Dein aktueller Fortschritt auf diesem Gerät wird durch die Sicherung ersetzt."
        cancelLabel="Abbrechen"
        confirmLabel="Importieren"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          importState(pendingImport)
          setPendingImport(null)
          emit({ type: 'toast', icon: '✅', text: 'Sicherung importiert.' })
          navigate('/', { replace: true })
        }}
      />
    </main>
  )
}
