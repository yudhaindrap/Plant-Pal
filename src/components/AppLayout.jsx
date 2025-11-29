import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Home, Leaf, PlusCircle, User as UserIcon, LogOut } from 'lucide-react';

// Context
import { useAuth } from '../context/AuthContext.jsx';
import { usePlantData } from '../context/PlantDataContext.jsx';

// Page Components
import HomePage from '../pages/HomePage.jsx';
import CollectionPage from '../pages/CollectionPage.jsx';
import AddPage from '../pages/AddPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import DetailPage from '../pages/DetailPage.jsx';

/* ------------------------------------------------------
   Komponen Tombol Navigasi (Desktop & Mobile)
------------------------------------------------------ */
const NavBtn = ({ icon: Icon, label, active, onClick, isDesktop = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 p-3 rounded-xl transition-colors
      ${isDesktop ? 'w-full justify-start' : 'flex-col justify-center gap-1'}
      ${active
        ? 'text-green-800 bg-green-100 font-semibold'
        : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}
    `}
  >
    <Icon size={isDesktop ? 20 : 24} strokeWidth={active ? 2.5 : 2} />
    <span className={isDesktop ? 'text-sm' : 'text-[10px] font-medium'}>
      {label}
    </span>
  </button>
);

/* ------------------------------------------------------
   App Layout
------------------------------------------------------ */
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

  /* ------------------------------
       Render Halaman Dinamis
  ------------------------------- */
  const renderPage = () => {
    if (selectedPlant) {
      return (
        <DetailPage
          key="detail-page"
          plant={selectedPlant}
          onBack={handleBack}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            key="home"
            plants={plants}
            user={userVisual}
            onDetail={handleDetail}
          />
        );

      case 'collection':
        return (
          <CollectionPage
            key="collection"
            plants={plants}
            onDetail={handleDetail}
          />
        );

      case 'add':
        return (
          <AddPage
            key="add"
            userId={session?.user?.id || 'anonymous'}
            onSaveSuccess={() => navigateTo('home')}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            key="profile"
            user={userVisual}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <HomePage
            key="home"
            plants={plants}
            user={userVisual}
            onDetail={handleDetail}
          />
        );
    }
  };

  /* ------------------------------
           RETURN TEMPLATE
  ------------------------------- */
  return (
    <div className="w-full h-full min-h-screen bg-gray-100 flex justify-center items-start">

      {/* ============================
            MOBILE LAYOUT
      ============================= */}
      <div className="w-full max-w-md h-[100dvh] bg-gray-50 relative shadow-2xl overflow-hidden flex flex-col md:hidden">

        {/* Konten Mobile */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-100 px-6 py-3 pb-6 flex justify-between items-center z-40">

          <NavBtn
            icon={Home}
            label="Beranda"
            active={activeTab === 'home'}
            onClick={() => navigateTo('home')}
          />

          <NavBtn
            icon={Leaf}
            label="Koleksi"
            active={activeTab === 'collection'}
            onClick={() => navigateTo('collection')}
          />

          {/* Floating Add Button */}
          <div className="relative -top-8">
            <button
              onClick={() => navigateTo('add')}
              className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110
                ${activeTab === 'add'
                  ? 'bg-green-700 rotate-45 ring-4 ring-green-100'
                  : 'bg-green-600 text-white'}
              `}
            >
              <PlusCircle size={32} color="white" />
            </button>
          </div>

          <NavBtn
            icon={UserIcon}
            label="Profil"
            active={activeTab === 'profile'}
            onClick={() => navigateTo('profile')}
          />

        </div>
      </div>

      {/* ============================
            DESKTOP LAYOUT
      ============================= */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] w-full md:h-screen bg-white overflow-hidden">

        {/* Sidebar Desktop */}
        <header className="bg-white p-6 border-r border-gray-100 flex flex-col justify-between h-full">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/pwa-192x192.png"
                alt="PlantPal Logo"
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-800">PlantPal</h1>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              <NavBtn isDesktop icon={Home} label="Beranda" active={activeTab === 'home'} onClick={() => navigateTo('home')} />
              <NavBtn isDesktop icon={Leaf} label="Koleksi Tanaman" active={activeTab === 'collection'} onClick={() => navigateTo('collection')} />
              <NavBtn isDesktop icon={PlusCircle} label="Tambah Tanaman Baru" active={activeTab === 'add'} onClick={() => navigateTo('add')} />
              <NavBtn isDesktop icon={UserIcon} label="Profil Pengguna" active={activeTab === 'profile'} onClick={() => navigateTo('profile')} />
            </nav>
          </div>

          {/* User Info + Logout */}
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

        {/* Main Content */}
        <main className="overflow-y-auto scrollbar-hide md:py-8 md:pr-8">
          <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
        </main>

      </div>

    </div>
  );
};

export default AppLayout;
