// src/components/AppLayout.jsx

import React from 'react';
import { AnimatePresence } from 'framer-motion';
// IMPOR BARU: BookOpen untuk ikon Artikel/Panduan
import { Home, Leaf, PlusCircle, User as UserIcon, LogOut, BookOpen } from 'lucide-react'; 

// Context
import { useAuth } from '../context/AuthContext.jsx';
import { usePlantData } from '../context/PlantDataContext.jsx';

// Page Components
import HomePage from '../pages/HomePage.jsx';
import CollectionPage from '../pages/CollectionPage.jsx';
import AddPage from '../pages/AddPage.jsx';
// IMPOR BARU: Halaman Artikel
import ArticlePage from '../pages/ArticlePage.jsx'; 
import ProfilePage from '../pages/ProfilePage.jsx';
import DetailPage from '../pages/DetailPage.jsx';

// Komponen Kecil Navigasi (Desktop & Mobile) (TIDAK BERUBAH)
const NavBtn = ({ icon: Icon, label, active, onClick, isDesktop = false }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 transition-colors rounded-xl p-3
      ${isDesktop ? 'w-full justify-start' : 'flex-col justify-center gap-1'}
      ${active ? 'text-green-800 bg-green-100 font-semibold' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}
    `}
  >
    <Icon size={isDesktop ? 20 : 24} strokeWidth={active ? 2.5 : 2} />
    <span className={isDesktop ? 'text-sm' : 'text-[10px] font-medium'}>{label}</span>
  </button>
);

const AppLayout = () => {
  const { userVisual, handleLogout, session } = useAuth();
  const { 
    plants, 
    activeTab, 
    selectedPlant, 
    handleDetail, 
    handleBack, 
    navigateTo 
  } = usePlantData();

  // Menentukan konten halaman berdasarkan activeTab
  const renderPage = () => {
    // Jika ada plant yang dipilih, selalu tampilkan DetailPage (mengabaikan activeTab)
    if (selectedPlant) {
      return <DetailPage key="detail-page" plant={selectedPlant} onBack={handleBack} />;
    }
    
    // Penanganan Page
    switch (activeTab) {
      case 'home':
        return <HomePage key="home" plants={plants} user={userVisual} onDetail={handleDetail} />;
      case 'collection':
        return <CollectionPage key="collection" plants={plants} onDetail={handleDetail} />;
      case 'add':
        // Menggunakan optional chaining untuk safety check
        const userId = session?.user?.id || 'anonymous';
        return <AddPage key="add" userId={userId} onSaveSuccess={() => navigateTo('home')} />;

      // KASUS BARU: Halaman Artikel
      case 'articles': 
        return <ArticlePage key="articles" />;

      case 'profile':
        return <ProfilePage key="profile" user={userVisual} onLogout={handleLogout} />;
      default:
        return <HomePage key="home" plants={plants} user={userVisual} onDetail={handleDetail} />;
    }
  }

  return (
    // CONTAINER UTAMA - Responsif
    <div className="w-full h-full min-h-screen bg-gray-100 flex justify-center items-start"> 
      
      {/* 1. TATA LETAK MOBILE (Fixed Width/Height) */}
      <div className="w-full max-w-md h-[100dvh] bg-gray-50 relative shadow-2xl overflow-hidden flex flex-col md:hidden">
        
        {/* Konten Mobile Scrollable */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </main>

        {/* BOTTOM NAVIGATION (Hanya Mobile) */}
        <div className="bg-white border-t border-gray-100 px-3 py-3 pb-6 flex justify-around items-center z-40">
          <NavBtn icon={Home} label="Beranda" active={activeTab === 'home'} onClick={() => navigateTo('home')} />
          <NavBtn icon={Leaf} label="Koleksi" active={activeTab === 'collection'} onClick={() => navigateTo('collection')} />
          
          {/* Floating Add Button */}
          <div className="relative -top-3">
            <button 
              onClick={() => navigateTo('add')}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${activeTab === 'add' ? 'bg-green-700 rotate-45 ring-4 ring-green-100' : 'bg-green-600 text-white'}`}
            >
              <PlusCircle size={32} color="white" />
            </button>
          </div>
            
            {/* TOMBOL BARU: ARTIKEL (Mobile) */}
          <NavBtn icon={BookOpen} label="Artikel" active={activeTab === 'articles'} onClick={() => navigateTo('articles')} />

          <NavBtn icon={UserIcon} label="Profil" active={activeTab === 'profile'} onClick={() => navigateTo('profile')} />
        </div>
      </div>
      
      {/* 2. TATA LETAK DESKTOP (Grid Layout) */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] md:gap-0 w-full md:h-screen bg-white overflow-hidden">
        
        {/* SIDEBAR / HEADER (Desktop) */}
        <header className="bg-white p-6 border-r border-gray-100 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img 
                src="/pwa-192x192.png" 
                alt="PlantPal Logo" 
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800">PlantPal</h1>
            </div>

            {/* Navigasi Utama Desktop */}
            <nav className="space-y-2">
              <NavBtn isDesktop icon={Home} label="Beranda" active={activeTab === 'home'} onClick={() => navigateTo('home')} />
              <NavBtn isDesktop icon={Leaf} label="Koleksi Tanaman" active={activeTab === 'collection'} onClick={() => navigateTo('collection')} />
              <NavBtn isDesktop icon={PlusCircle} label="Tambah Tanaman Baru" active={activeTab === 'add'} onClick={() => navigateTo('add')} />
                
                {/* TOMBOL BARU: ARTIKEL (Desktop) */}
              <NavBtn isDesktop icon={BookOpen} label="Artikel Tanaman" active={activeTab === 'articles'} onClick={() => navigateTo('articles')} />
                
              <NavBtn isDesktop icon={UserIcon} label="Profil Pengguna" active={activeTab === 'profile'} onClick={() => navigateTo('profile')} />
            </nav>
          </div>

          {/* User Info dan Logout Desktop */}
          <div className="border-t border-gray-100 pt-4">
             {userVisual && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                    <img src={userVisual.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{userVisual.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userVisual.email}</p>
                    </div>
                </div>
            )}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Keluar (Logout)
            </button>
          </div>
        </header>
        
        {/* AREA KONTEN UTAMA (Desktop) */}
        <main className="overflow-y-auto scrollbar-hide md:py-8 md:pr-8">
          <AnimatePresence mode="wait">
              {renderPage()}
          </AnimatePresence>
        </main>
      </div>
      
    </div>
  );
};

export default AppLayout; 