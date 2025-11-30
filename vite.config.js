// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // === KONFIGURASI OFFLINE (WORKBOX) ===
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache semua file statis app
        maximumFileSizeToCacheInBytes: 3000000, // Naikkan batas ukuran file cache (3MB)
        
        runtimeCaching: [
          // 0. 🔥 BARU DITAMBAHKAN: Cache Permintaan API REST Supabase
          {
            // Pola URL API REST Supabase Anda
            // Menggunakan Project URL yang Anda berikan: https://vflaxkuchicauwsmvynd.supabase.co
            urlPattern: /^https:\/\/vflaxkuchicauwsmvynd\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate', // Cepat tampilkan data cache, lalu update di background saat online
            options: {
              cacheName: 'supabase-api-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 Hari
              },
              // Pastikan hanya respons sukses (200) atau opaque (0) yang dicache
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          },
          // 1. Cache Gambar dari Placehold.co (Avatar default)
          {
            urlPattern: /^https:\/\/placehold\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'placeholder-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Hari
              }
            }
          },
          // 2. Cache Gambar dari Supabase Storage (Avatar user/tanaman)
          {
            // Ganti URL ini dengan URL project Supabase Anda jika berbeda
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'StaleWhileRevalidate', // Tampilkan cache dulu, sambil update di background
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Hari
              }
            }
          },
          // 3. Cache Font Google (Jika pakai)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Tahun
              }
            }
          }
        ]
      },
      
      devOptions: {
        enabled: true 
      },
      
      manifest: {
        name: 'PlantPal - Aplikasi Tanaman',
        short_name: 'PlantPal',
        description: 'Kelola tanaman hias Anda dengan mudah',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone', // Hapus URL bar browser (Tampilan App Native)
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png', // Pastikan file ini ada di folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // Pastikan file ini ada di folder public
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Agar icon bulat di Android terlihat bagus
          }
        ]
      }
    })
  ],
})