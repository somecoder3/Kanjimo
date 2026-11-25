/** Vorlesen japanischer Lesungen über die Web Speech API. */
import { useStore } from './store'

let jaVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  try {
    const voices = speechSynthesis.getVoices()
    jaVoice =
      voices.find((v) => v.lang === 'ja-JP' && /google|kyoko|o-ren|nanami|haruka/i.test(v.name)) ??
      voices.find((v) => v.lang?.toLowerCase().startsWith('ja')) ??
      null
  } catch {
    jaVoice = null
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function hasJapaneseVoice(): boolean {
  if (!jaVoice) pickVoice()
  return !!jaVoice
}

/** Spricht Text auf Japanisch. Gibt false zurück, wenn keine Stimme verfügbar ist. */
export function speak(text: string): boolean {
  if (!canSpeak()) return false
  if (!jaVoice) pickVoice()
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/[.\-]/g, ''))
    u.lang = 'ja-JP'
    if (jaVoice) u.voice = jaVoice
    u.rate = useStore.getState().settings.speechRate
    speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}
