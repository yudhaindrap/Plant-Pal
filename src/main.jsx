import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Import fungsi registrasi dari plugin PWA
import { registerSW } from 'virtual:pwa-register'

// === KONFIGURASI PWA (OFFLINE & AUTO UPDATE) ===
const updateSW = registerSW({
  onNeedRefresh() {
    // Muncul popup jika ada versi baru yang tersedia
    if (confirm('Versi baru tersedia. Refresh sekarang untuk update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // Log ini muncul jika app sudah berhasil di-cache dan siap offline
    console.log('Aplikasi siap bekerja offline!')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)