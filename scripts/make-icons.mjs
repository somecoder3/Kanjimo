// Erzeugt App-Icons (PNG) aus der Mo-Grafik.
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'

const mo = (tx, ty, s) => `
<g transform="translate(${tx} ${ty}) scale(${s})">
  <ellipse cx="60" cy="125" rx="34" ry="4.5" fill="#000" opacity=".12"/>
  <path d="M60 4 C 65 20, 104 50, 104 82 C 104 107, 85 124, 60 124 C 35 124, 16 107, 16 82 C 16 50, 55 20, 60 4 Z" fill="url(#g)"/>
  <ellipse cx="39" cy="62" rx="6" ry="12" transform="rotate(28 39 62)" fill="#fff" opacity=".32"/>
  <circle cx="45" cy="45" r="3" fill="#fff" opacity=".4"/>
  <ellipse cx="33" cy="101" rx="7.5" ry="4.2" fill="#ff8fab" opacity=".65"/>
  <ellipse cx="87" cy="101" rx="7.5" ry="4.2" fill="#ff8fab" opacity=".65"/>
  <ellipse cx="45" cy="86" rx="9" ry="10.5" fill="#fff"/><circle cx="45" cy="87" r="6.2" fill="#0e0f26"/><circle cx="47.4" cy="84.2" r="2.3" fill="#fff"/>
  <ellipse cx="75" cy="86" rx="9" ry="10.5" fill="#fff"/><circle cx="75" cy="87" r="6.2" fill="#0e0f26"/><circle cx="77.4" cy="84.2" r="2.3" fill="#fff"/>
  <path d="M51 99 Q60 99 69 99 Q68 110 60 110 Q52 110 51 99 Z" fill="#3a0f25" stroke="#f3eefe" stroke-width="2" stroke-linejoin="round"/>
  <path d="M54.5 106 Q60 102.5 65.5 106 Q63 109.5 60 109.5 Q57 109.5 54.5 106 Z" fill="#ff8a9b"/>
</g>`
const defs = `<defs><radialGradient id="g" cx=".35" cy=".45" r=".75"><stop offset="0" stop-color="#64646e"/><stop offset=".55" stop-color="#24242a"/><stop offset="1" stop-color="#050507"/></radialGradient></defs>`

const icon = (size, { round = true, scale = 0.62 } = {}) => {
  const s = (size * scale) / 130
  const w = 120 * s
  const h = 130 * s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <rect width="${size}" height="${size}" rx="${round ? size * 0.22 : 0}" fill="#fbf6ee"/>
  <circle cx="${size / 2}" cy="${size / 2 + h * 0.06}" r="${size * 0.36}" fill="#f3e3cf"/>
  ${mo((size - w) / 2, (size - h) / 2 + h * 0.02, s)}</svg>`
}

await writeFile('public/favicon.svg', icon(64, { scale: 0.78 }))
await sharp(Buffer.from(icon(192))).png().toFile('public/pwa-192.png')
await sharp(Buffer.from(icon(512))).png().toFile('public/pwa-512.png')
await sharp(Buffer.from(icon(512, { round: false, scale: 0.5 }))).png().toFile('public/maskable-512.png')
await sharp(Buffer.from(icon(180, { round: false, scale: 0.64 }))).png().toFile('public/apple-touch-icon.png')
console.log('Icons erstellt.')
