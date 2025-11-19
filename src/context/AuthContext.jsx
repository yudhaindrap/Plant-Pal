import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Leaf } from 'lucide-react';

const AuthContext = createContext();

// Hook kustom untuk mempermudah penggunaan
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cek Session saat pertama kali mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // 2. Listener perubahan otentikasi (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // User Data Visual Mocking
  const userVisual = session ? {
    id: session.user.id,
    name: session.user.email.split('@')[0],
    email: session.user.email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
  } : null;

  const value = {
    session,
    userVisual,
    loading,
    handleLogout,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Component loading screen sederhana
export const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <Leaf className="text-green-600 animate-pulse" size={48} />
    <p className="mt-4 text-gray-600 font-medium">Memuat sesi...</p>
  </div>
);