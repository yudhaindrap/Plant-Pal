import React, { useState, useEffect } from 'react';
// Import AnimatePresence dan motion dari framer-motion untuk transisi halus
import { AnimatePresence, motion } from 'framer-motion';

// Contexts
// DIKEMBALIKAN: Menambahkan ekstensi .jsx ke impor lokal
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { PlantDataProvider } from './context/PlantDataContext.jsx';

// Components & Screens - Import langsung (Menghapus lazy loading dan Suspense)
// Ini menghilangkan flicker loading screen ganda.
// DIKEMBALIKAN: Menambahkan ekstensi .jsx ke impor lokal
import AuthScreen from './components/AuthScreen.jsx';
import AppLayout from './components/AppLayout.jsx';

// Komponen Splash Screen
// DIKEMBALIKAN: Menambahkan ekstensi .jsx ke impor lokal
import LoadingScreen from './components/LoadingScreen.jsx';

// Main Application Component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // State baru untuk memastikan durasi minimum telah tercapai
  const [minLoadTimeReached, setMinLoadTimeReached] = useState(false);

  // Efek untuk mengatur timer minimum load time
  useEffect(() => {
    // Tahan splash screen selama 3 detik (sesuai durasi progress bar)
    const MINIMUM_LOAD_TIME = 3000; 

    const timer = setTimeout(() => {
      setMinLoadTimeReached(true);
    }, MINIMUM_LOAD_TIME);

    // Cleanup timer saat komponen di-unmount
    return () => clearTimeout(timer);
  }, []);

  // Variabel untuk menentukan apakah splash screen harus aktif
  // Pastikan `AuthContext` selesai memuat DAN waktu minimum telah tercapai
  const isSplashScreenActive = loading || !minLoadTimeReached;

  return (
    // AnimatePresence mode="wait" memastikan satu komponen selesai exit sebelum komponen baru mount.
    <AnimatePresence mode="wait">
      {isSplashScreenActive ? (
        // Tampilkan LoadingScreen (memudar keluar 0.5s)
        <LoadingScreen key="splash-screen" />
      ) : (
        // Tampilkan konten utama/login setelah loading selesai, TANPA Suspense
        isAuthenticated ? (
          // Jika sudah login
          <PlantDataProvider>
            {/* Gunakan motion.div untuk menganimasikan AppLayout saat muncul */}
            <motion.div 
              key="app-layout" // Kunci unik untuk AnimatePresence
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-100 min-h-screen flex justify-center items-start md:items-center w-full"
            >
              <AppLayout />
            </motion.div>
          </PlantDataProvider>
        ) : (
          // Jika belum login, tampilkan halaman AuthScreen
          <motion.div 
            key="auth-screen" // Kunci unik untuk AnimatePresence
            initial={{ opacity: 0 }} // Memudar masuk
            animate={{ opacity: 1 }} // Memudar masuk
            transition={{ duration: 0.5 }}
            className="w-full min-h-screen"
          >
            <AuthScreen />
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};

// Root Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;