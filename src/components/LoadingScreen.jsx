import React from 'react';
import { motion } from 'framer-motion';

/**
 * Komponen LoadingScreen (Splash Screen) dengan Animasi Super Modern
 */
const LoadingScreen = () => {
  // Container untuk Teks dan Logo
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Jeda antar elemen
        delayChildren: 0.2,
      },
    },
  };

  // Varian untuk setiap item (Logo, Judul, Subtitle)
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  // Animasi untuk logo (Tanaman) - Efek "floating" dan "pulse" yang lebih intens
  const leafVariants = {
    ...itemVariants, // Mewarisi animasi entri
    animate: { 
      y: [0, -15, 0], // Bergerak naik turun lebih jauh
      rotate: [0, 8, -8, 0], // Berayun lebih lebar
      transition: { 
        duration: 3.5, 
        ease: "easeInOut",
        repeat: Infinity, 
      } 
    },
  };
  
  // Animasi untuk bilah kemajuan (Determinate Progress Bar)
  // PROGRESS BAR DIUBAH UNTUK MENGISI 0% SAMPAI 100% DALAM 3 DETIK
  const progressBarVariants = {
    // Animasi garis bergerak dari kiri ke kanan berulang (dihapus)
    // Sekarang hanya menentukan animasi 'fill'
    fill: {
      width: ["0%", "100%"], // Mengisi lebar dari 0% ke 100%
      transition: {
        duration: 3.0, // Durasi 3 detik
        ease: "easeInOut",
      },
    },
  };
  
  // Animasi untuk latar belakang (Gradien Hijau Muda yang Bergelombang)
  const backgroundVariants = {
    animate: {
      // Mengubah posisi gradien untuk efek berombak yang lebih cepat
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      transition: {
        duration: 15, // Durasi sedikit dipersingkat
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    // Memenuhi seluruh layar dengan latar belakang gradien animasi hijau muda
    <motion.div 
      key="loadingScreen" // Penting untuk AnimatePresence
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden"
      variants={backgroundVariants}
      initial={{ 
        // Warna gradien yang lebih cerah
        background: 'linear-gradient(135deg, #A7F3D0, #34D399, #10B981, #A7F3D0)',
        backgroundSize: '400% 400%',
      }}
      animate="animate"
      // PROPERTI BARU: Animasi saat komponen dihapus
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      
      {/* Container Logo dan Nama - Menganimasikan saat muncul */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        {/* Logo/Icon Aplikasi yang dianimasikan (dengan varian item entri) */}
        <motion.div 
          className="bg-white/90 p-5 rounded-full shadow-2xl mb-6 ring-4 ring-white/30"
          variants={leafVariants}
          animate={["visible", "animate"]} // Jalankan animasi entri dan floating secara bersamaan
          initial="hidden"
        >
          <img
            src="/pwa-192x192.png" 
            alt="PlantPal Logo"
            className="h-20 w-20 object-contain filter drop-shadow-lg"
          />
        </motion.div>
        
        {/* Nama Aplikasi */}
        <motion.h1 
          className="text-6xl font-black text-white drop-shadow-xl tracking-wider mb-2"
          variants={itemVariants}
        >
          PlantPal
        </motion.h1>
        
        {/* Slogan */}
        <motion.p 
          className="text-lg text-white/90 font-light italic drop-shadow-md"
          variants={itemVariants}
        >
          Merawat tanaman jadi lebih mudah
        </motion.p>
      </motion.div>
      
      {/* Container untuk Progress Bar (Progress Bar) */}
      <div className="w-64 mt-16 h-2 bg-white/30 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-white rounded-full"
          variants={progressBarVariants}
          initial={{ width: '0%' }} // Dimulai dari 0%
          animate="fill" // Menggunakan varian 'fill' yang baru
        />
      </div>
      
    </motion.div>
  );
};

export default LoadingScreen;