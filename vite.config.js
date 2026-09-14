import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `--host 0.0.0.0` (in package.json's dev/preview scripts) plus this config
// is what makes the dev server reachable from a phone on the same Wi-Fi at
// http://<server-lan-ip>:5173 — binding to localhost only would keep it
// reachable from the server machine alone.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Expense Ledger',
        short_name: 'Ledger',
        description: 'Household expense ledger with envelope budgets',
        theme_color: '#2f6f4e',
        background_color: '#f6f5f1',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // App shell: cache-first. API calls: always try the network first so
        // totals are never served stale — falls back to cache only if the
        // server is briefly unreachable (e.g. mid Wi-Fi hiccup).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
