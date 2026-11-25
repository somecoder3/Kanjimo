import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/global.css'
import './styles/screens.css'
import { initSrs } from './lib/srs'
import { hydrate } from './lib/store'
import { loadAllLevels } from './data/levels'
import { App } from './App'

async function boot() {
  await Promise.all([initSrs(), hydrate(), loadAllLevels()])
  document.getElementById('splash')?.remove()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot().catch((err) => {
  console.error(err)
  const root = document.getElementById('root')
  if (root) root.innerHTML = '<p style="padding:24px;font-family:sans-serif">Kanjimo konnte nicht starten. Bitte lade die Seite neu.</p>'
})
