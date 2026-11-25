/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  base: './',
  // Die N1-Strichdaten sind bewusst ein großer, vom Service Worker vorgehaltener Block.
  build: { chunkSizeWarningLimit: 1100 },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kanjimo – Kanji lernen mit Mo',
        short_name: 'Kanjimo',
        description: 'Lerne Kanji spielerisch mit Mo, dem kleinen Tintentropfen.',
        lang: 'de',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf6ee',
        theme_color: '#fbf6ee',
        categories: ['education', 'games'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Selbst gehostete Schrift-Teildateien werden bei Bedarf geladen und dann offline vorgehalten.
            urlPattern: ({ url }) => /\.(woff2?)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'kanjimo-fonts',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    testTimeout: 60_000,
  },
})
