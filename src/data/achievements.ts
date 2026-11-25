import type { PersistedState } from '../lib/store'
import { levelInfo } from '../lib/gamification'
import { mastery } from '../lib/srs'
import { KANJI, UNITS } from './kanji'

const levelDone = (s: PersistedState, l: number) => {
  const list = KANJI.filter((k) => (k.level ?? 5) === l)
  return list.length > 0 && list.every((k) => s.progress[k.c])
}

export interface Achievement {
  id: string
  icon: string
  title: string
  desc: string
  check: (s: PersistedState) => boolean
}

const learned = (s: PersistedState) => Object.keys(s.progress).length
const mastered = (s: PersistedState) => Object.values(s.progress).filter((p) => mastery(p.card) >= 3).length

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '🖌️', title: 'Erster Pinselstrich', desc: 'Lerne dein erstes Kanji.', check: (s) => learned(s) >= 1 },
  { id: 'k10', icon: '🌱', title: 'Zehn Zeichen', desc: 'Lerne 10 Kanji.', check: (s) => learned(s) >= 10 },
  { id: 'k25', icon: '🌿', title: 'Kleiner Garten', desc: 'Lerne 25 Kanji.', check: (s) => learned(s) >= 25 },
  { id: 'k50', icon: '🌳', title: 'Halbzeit', desc: 'Lerne 50 Kanji.', check: (s) => learned(s) >= 50 },
  { id: 'k100', icon: '💯', title: 'Hundert Zeichen', desc: 'Lerne 100 Kanji.', check: (s) => learned(s) >= 100 },
  { id: 'k500', icon: '🎋', title: 'Bambushain', desc: 'Lerne 500 Kanji.', check: (s) => learned(s) >= 500 },
  { id: 'k1000', icon: '🌲', title: 'Tausend Pinselstriche', desc: 'Lerne 1000 Kanji.', check: (s) => learned(s) >= 1000 },
  { id: 'kall', icon: '🏯', title: 'N5-Meister', desc: 'Lerne alle Kanji der Stufe N5.', check: (s) => levelDone(s, 5) },
  { id: 'n4', icon: '⛩️', title: 'N4-Meister', desc: 'Lerne alle Kanji der Stufe N4.', check: (s) => levelDone(s, 4) },
  { id: 'n3', icon: '🗾', title: 'N3-Meister', desc: 'Lerne alle Kanji der Stufe N3.', check: (s) => levelDone(s, 3) },
  { id: 'n2', icon: '🐉', title: 'N2-Meister', desc: 'Lerne alle Kanji der Stufe N2.', check: (s) => levelDone(s, 2) },
  { id: 'n1', icon: '🌕', title: 'Kanji-Großmeister', desc: 'Lerne alle Kanji bis N1.', check: (s) => levelDone(s, 1) },
  { id: 'unit1', icon: '📜', title: 'Erste Schriftrolle', desc: 'Schließe deine erste Einheit ab.', check: (s) => Object.keys(s.units).length >= 1 },
  { id: 'unit3stars', icon: '⭐', title: 'Sternstunde', desc: 'Schließe eine Einheit mit 3 Sternen ab.', check: (s) => Object.values(s.units).some((u) => u.stars >= 3) },
  { id: 'units-all', icon: '🗻', title: 'Gipfelstürmer', desc: 'Schließe alle Einheiten aller Stufen ab.', check: (s) => UNITS.every((u) => s.units[u.id]) },
  { id: 'streak3', icon: '🔥', title: 'Funke', desc: 'Lerne 3 Tage in Folge.', check: (s) => s.stats.bestStreak >= 3 },
  { id: 'streak7', icon: '🎇', title: 'Eine Woche Feuer', desc: 'Lerne 7 Tage in Folge.', check: (s) => s.stats.bestStreak >= 7 },
  { id: 'streak30', icon: '☄️', title: 'Unaufhaltsam', desc: 'Lerne 30 Tage in Folge.', check: (s) => s.stats.bestStreak >= 30 },
  { id: 'rev100', icon: '🔁', title: 'Wiederholungstäter', desc: 'Schaffe 100 Wiederholungen.', check: (s) => s.stats.reviews >= 100 },
  { id: 'rev1000', icon: '🧠', title: 'Gedächtnispalast', desc: 'Schaffe 1000 Wiederholungen.', check: (s) => s.stats.reviews >= 1000 },
  { id: 'perfect', icon: '✨', title: 'Fehlerfrei', desc: 'Eine Wiederholung mit mind. 10 Karten ohne Fehler.', check: (s) => s.stats.perfectSessions >= 1 },
  { id: 'combo15', icon: '⚡', title: 'Combo-Künstler', desc: 'Erreiche eine 15er-Combo.', check: (s) => s.stats.bestCombo >= 15 },
  { id: 'write50', icon: '✍️', title: 'Fleißige Hand', desc: 'Schreibe 50 Kanji.', check: (s) => s.stats.writes >= 50 },
  { id: 'master10', icon: '🌸', title: 'In voller Blüte', desc: 'Bringe 10 Kanji auf die Stufe „Wächst“.', check: (s) => mastered(s) >= 10 },
  { id: 'goal7', icon: '🎯', title: 'Zielstrebig', desc: 'Erreiche dein Tagesziel 7-mal.', check: (s) => s.stats.goalsMet >= 7 },
  { id: 'lvl5', icon: '🎖️', title: 'Level 5', desc: 'Erreiche Level 5.', check: (s) => levelInfo(s.stats.xp).level >= 5 },
  { id: 'lvl10', icon: '👑', title: 'Level 10', desc: 'Erreiche Level 10.', check: (s) => levelInfo(s.stats.xp).level >= 10 },
  { id: 'blitz', icon: '🌩️', title: 'Blitzschnell', desc: 'Erreiche 300 Punkte in der Blitzrunde.', check: (s) => (s.stats.highscores.blitz ?? 0) >= 300 },
  { id: 'pairs', icon: '🃏', title: 'Gutes Gedächtnis', desc: 'Erreiche 850 Punkte bei „Paare finden“.', check: (s) => (s.stats.highscores.pairs ?? 0) >= 850 },
  { id: 'rain', icon: '☔', title: 'Regenmacher', desc: 'Erreiche 400 Punkte im Tintenregen.', check: (s) => (s.stats.highscores.rain ?? 0) >= 400 },
  { id: 'owl', icon: '🦉', title: 'Nachteule', desc: 'Lerne nach 22 Uhr.', check: (s) => s.stats.lateSessions >= 1 },
  { id: 'bird', icon: '🐦', title: 'Frühaufsteher', desc: 'Lerne vor 7 Uhr morgens.', check: (s) => s.stats.earlySessions >= 1 },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))
