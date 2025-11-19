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
  const [dataVersion, setDataVersion] = useState(0); 

  // Fungsi publik untuk memaksa useEffect mengambil data kembali
  const refreshData = () => {
    setDataVersion(v => v + 1);
  };

  // 1. Ambil Data Tanaman (Read)
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPlants = async () => {
        const { data: initialData, error } = await supabase
          .from('plants')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching plants:', error);
            return;
        }

        setPlants(initialData || []);
      };
      
      fetchPlants();
    } else {
        setPlants([]);
    }
  }, [isAuthenticated, dataVersion]); // dataVersion adalah dependency refresh

  // 2. Hapus Data Tanaman (Delete)
  const deletePlant = async (plantId) => {
    if (!isAuthenticated) return false;
    try {
      const { error } = await supabase.from('plants').delete().eq('id', plantId);
      if (error) throw error;
      
      // Sukses: Paksa refresh data
      setDataVersion(v => v + 1);
      setSelectedPlant(null); // Tutup detail
      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  };

  // 3. Perbarui Data Tanaman (Update) - Ditingkatkan untuk Debugging
  const updatePlant = async (plantId, updates) => {
    if (!isAuthenticated || !plantId) {
        console.error('Update failed: User not authenticated or plantId missing.');
        return false;
    }
      
    try {
      // Log untuk melihat apa yang dikirim ke Supabase
      console.log(`Attempting update on ID ${plantId} with:`, updates);

      const { data, error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .select(); // Tambahkan .select() untuk mendapatkan data yang diperbarui

      if (error) {
        // Log error Supabase yang spesifik, ini penting untuk mendiagnosis RLS/Schema
        console.error('Supabase Update Error (Check RLS/Schema!):', error);
        throw error;
      }
      
      // Sukses: Paksa refresh data
      setDataVersion(v => v + 1);
      // Perbarui selectedPlant secara lokal
      setSelectedPlant(prev => (prev ? { ...prev, ...updates } : null)); 
      
      return true;
    } catch (error) {
      console.error('Final catch block error in updatePlant:', error);
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
    deletePlant, // Sediakan fungsi delete
    updatePlant, // Sediakan fungsi update
    refreshData, // Fungsi yang digunakan oleh AddPage
  };

  return <PlantDataContext.Provider value={value}>{children}</PlantDataContext.Provider>;
};