import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // Only PWA-enabled in production builds — a service worker caching
      // module requests during `npm run dev` would fight with Vite's HMR.
      devOptions: { enabled: false },
      manifest: {
        name: 'Deutsch Lernen — German Learning',
        short_name: 'Deutsch Lernen',
        description:
          'Learn real, usable German fast — scenario-based lessons, spaced repetition, and an AI tutor.',
        theme_color: '#3b82f6',
        background_color: '#eff6ff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell (JS/CSS/HTML/icons) for offline load. Lesson
        // content is bundled into the JS (statically imported JSON), so it's
        // covered by this automatically. Supabase auth/DB/chat calls are
        // intentionally NOT cached here — serving stale auth state or lesson
        // progress from a cache would be actively wrong, not helpful.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
})
