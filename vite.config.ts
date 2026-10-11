import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],

      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/bootstrap\.yml$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'party-bootstrap',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 1,
              },
            },
          },
          {
            urlPattern: /^\/api\/parties$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'party-list',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 1,
              },
            },
          },
          {
            urlPattern: /^\/api\/parties\/[^/]+\/config$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'party-configs',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/parties/') &&
              !url.pathname.endsWith('/config') &&
              !/\.(mp4|webm|mov|mp3|m4a|wav|ogg)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'party-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },

      manifest: {
        name: 'PipBoy 2100',
        short_name: 'PipBoy',
        description: 'A configurable experience engine',
        theme_color: '#00ff66',
        background_color: '#101810',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})