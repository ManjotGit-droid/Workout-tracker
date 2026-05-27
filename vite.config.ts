import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Solo Leveling Gym Tracker',
        short_name: 'GymTracker',
        description: 'Level up your muscles, Solo Leveling style',
        theme_color: '#141B23',
        background_color: '#141B23',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Activate the new SW the moment it installs and take over open
        // tabs immediately — fixes the white/black screen the user saw
        // when a stale broken build kept being served between deploys.
        skipWaiting: true,
        clientsClaim: true,
        // Drop any caches that aren't part of the current precache list so
        // we don't keep serving outdated assets after a rapid follow-up
        // build (e.g. the prior white-screen hotfix).
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
