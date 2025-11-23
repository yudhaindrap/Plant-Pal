import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const PlantDataContext = createContext();

export const usePlantData = () => useContext(PlantDataContext);

export const PlantDataProvider = ({ children }) => {
  const { session, isAuthenticated } = useAuth();
  const [plants, setPlants] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlant, setSelectedPlant] = useState(null); 
  // const [dataVersion, setDataVersion] = useState(0); // Dihapus, tidak perlu untuk addPlant

  // Fungsi yang lebih baik untuk mengambil semua data tanaman
  const fetchAllPlants = async () => {
    if (!isAuthenticated) {
      setPlants([]);
      return;
    }
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching plants:', error);
        return;
    }

    setPlants(data || []);
  };

  // Fungsi publik untuk memicu pengambilan data (hanya digunakan untuk Update/Delete)
  const refreshData = () => {
    fetchAllPlants();
  };


  // 1. Ambil Data Tanaman saat mount atau login
  useEffect(() => {
    fetchAllPlants();
  }, [isAuthenticated]); // Hanya bergantung pada status otentikasi

  
  // 2. Tambah Data Tanaman (CREATE) - FUNGSI BARU YANG CEPAT
  const addPlant = async (newPlantData) => {
    if (!isAuthenticated) return false;

    try {
      // Pastikan ada user_id
      const plantWithUserId = { ...newPlantData, user_id: session.user.id };

      const { data, error } = await supabase
        .from('plants')
        .insert(plantWithUserId)
        .select() // Meminta Supabase mengembalikan baris yang baru dibuat
        .single();

      if (error) throw error;

      // ✅ PERBAIKAN UTAMA: Tambahkan data BARU SECARA LOKAL ke state, tanpa query ulang SEMUA
      if (data) {
        setPlants(prevPlants => [data, ...prevPlants]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding plant:', error);
      return false;
    }
  };

  // 3. Hapus Data Tanaman (Delete)
  const deletePlant = async (plantId) => {
    if (!isAuthenticated) return false;
    try {
      const { error } = await supabase.from('plants').delete().eq('id', plantId);
      if (error) throw error;
      
      // ✅ PERBAIKAN: Hapus secara lokal tanpa query ulang (opsional, tapi cepat)
      setPlants(prevPlants => prevPlants.filter(p => p.id !== plantId));
      setSelectedPlant(null); // Tutup detail
      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  };

  // 4. Perbarui Data Tanaman (Update)
  const updatePlant = async (plantId, updates) => {
    if (!isAuthenticated || !plantId) {
        console.error('Update failed: User not authenticated or plantId missing.');
        return false;
    }
      
    try {
      const { data, error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .select() // Dapatkan data yang diperbarui
        .single();

      if (error) throw error;
      
      // ✅ PERBAIKAN: Perbarui state secara lokal
      setPlants(prevPlants => prevPlants.map(p => 
        p.id === plantId ? { ...p, ...updates } : p
      ));

      // Perbarui selectedPlant
      setSelectedPlant(prev => (prev ? { ...prev, ...updates } : null)); 
      
      return true;
    } catch (error) {
      console.error('Error in updatePlant:', error);
      return false;
    }
  };


  // Logic Navigasi
  const handleDetail = (plant) => setSelectedPlant(plant);
  const handleBack = () => setSelectedPlant(null);
  const navigateTo = (tabName) => {
    setActiveTab(tabName);
    setSelectedPlant(null); // Tutup detail saat pindah tab
  }

  const value = {
    plants,
    activeTab,
    selectedPlant,
    handleDetail,
    handleBack,
    navigateTo,
    addPlant, 
    deletePlant, 
    updatePlant, 
    refreshData, // Tetap sediakan (untuk jaga-jaga)
  };

  return <PlantDataContext.Provider value={value}>{children}</PlantDataContext.Provider>;
};