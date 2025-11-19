import React from 'react';

// Contexts
import { AuthProvider, useAuth, LoadingScreen } from './context/AuthContext';
import { PlantDataProvider } from './context/PlantDataContext';

// Components & Screens
import AuthScreen from './components/AuthScreen';
import AppLayout from './components/AppLayout';

// Main Application Component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Routing Sederhana
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    // Memastikan tata letak responsif tetap di tengah layar
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      {/* Jika sudah login, berikan akses data dan tampilkan layout utama */}
      <PlantDataProvider>
        <AppLayout />
      </PlantDataProvider>
    </div>
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