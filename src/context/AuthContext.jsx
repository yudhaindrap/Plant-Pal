import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Leaf } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // State untuk data tabel profiles
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data profil dari database
  const fetchProfile = async (userId) => {
    try {
      // 💡 PERBAIKAN: Hanya ambil kolom yang dibutuhkan (full_name dan avatar_url)
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url') 
        .eq('id', userId)
        .single();

      // PGRST116 adalah "tidak ditemukan baris", ini normal untuk user baru
      if (error && error.code !== 'PGRST116') {
        throw error; 
      }
      
      // Jika data ada, simpan ke state
      if (data) {
        setProfile(data);
      } else {
        setProfile(null); // Reset profil jika tidak ditemukan
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message || error);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Session error:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // refreshProfile agar bisa dipanggil setelah edit data
  const refreshProfile = async () => {
    if (session) await fetchProfile(session.user.id);
  };

  // Menggabungkan data Auth (Email) dengan data Tabel (Nama & Avatar)
  const userVisual = session ? {
    id: session.user.id,
    email: session.user.email,
    // Gunakan nama dari database, jika kosong gunakan bagian depan email
    name: profile?.full_name || session.user.email.split('@')[0], 
    // Gunakan avatar dari database, jika kosong gunakan generator
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
    // Opsional: Total tanaman bisa diambil dari query count nanti
    totalPlants: 0 
  } : null;

  const value = {
    session,
    userVisual,
    loading,
    handleLogout,
    refreshProfile, // Expose fungsi ini ke halaman lain
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <Leaf className="text-green-600 animate-pulse" size={48} />
    <p className="mt-4 text-gray-600 font-medium">Memuat PlantPal...</p>
  </div>
);