import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SPA mode for PWA (no SSR needed for offline-first)
  ssr: false,

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Modules
  modules: ['@vite-pwa/nuxt', '@nuxt/eslint'],

  // Vite configuration
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/piper-tts-web/dist/onnx/*.wasm',
            dest: 'onnx',
          },
          {
            src: 'node_modules/piper-tts-web/dist/piper/*',
            dest: 'piper',
          },
          {
            src: 'node_modules/piper-tts-web/dist/worker/*.js',
            dest: 'worker',
          },
        ],
      }),
    ],
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:4000/api',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Audiary — AI Audiobook Player',
      short_name: 'Audiary',
      description:
        'Convert text into audiobooks using on-device TTS. Privacy-first, offline-capable.',
      theme_color: '#1a1a2e',
      background_color: '#0a0a14',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          // Cache API responses — NetworkFirst for freshness
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Cache TTS models — CacheFirst (large files, rarely change)
          urlPattern: /\.onnx$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tts-models',
            expiration: {
              maxEntries: 5,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            rangeRequests: true,
          },
        },
        {
          // Cache Google Fonts
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  // App config
  app: {
    head: {
      title: 'Audiary — AI Audiobook Player',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Convert text into natural-sounding audiobooks using on-device TTS. Offline-first, privacy-focused PWA.',
        },
        { name: 'theme-color', content: '#1a1a2e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
});
