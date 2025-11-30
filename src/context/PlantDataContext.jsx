import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const PlantDataContext = createContext();

export const usePlantData = () => useContext(PlantDataContext);

export const PlantDataProvider = ({ children }) => {
  const { session, isAuthenticated, refreshTotalPlantsCount } = useAuth();
  const [plants, setPlants] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlant, setSelectedPlant] = useState(null);

  // --- LOGIC ALARM GLOBAL DIMULAI DI SINI ---
  
  // 1. Meminta Izin Notifikasi
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Interval Pengecekan Waktu (Berjalan setiap 10 detik saat app terbuka)
  useEffect(() => {
    // Note: Interval ini akan dibatasi atau dihentikan oleh browser jika tab tidak aktif/tertutup.
    if (!isAuthenticated || plants.length === 0) return;

    const checkSchedules = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
      const todayDate = now.toISOString().split('T')[0];

      plants.forEach(plant => {
        if (!plant.watering_schedule || plant.watering_schedule.length === 0 || plant.needsWater) return; // Skip if already needs water

        if (plant.watering_schedule.includes(currentTime)) {
          
          const notifKey = `notif-${plant.id}-${currentTime}-${todayDate}`;
          const alreadyNotifiedToday = localStorage.getItem(notifKey);

          if (!alreadyNotifiedToday) {
            
            // 1. Trigger Notifikasi Browser
            if (Notification.permission === "granted") {
              if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                 navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(`Waktunya menyiram ${plant.name}!`, {
                      body: `Sekarang jam ${currentTime}, ayo cek tanamanmu! 🌱`,
                      icon: plant.image_url || '/pwa-512x512.png',
                      vibrate: [200, 100, 200]
                    });
                 });
              } else {
                 new Notification(`Waktunya menyiram ${plant.name}!`, {
                   body: `Sekarang jam ${currentTime}, ayo cek tanamanmu! 🌱`,
                   icon: '/pwa-512x512.png'
                 });
              }
            }

            // 2. Update Status Tanaman jadi "Butuh Air" (Kuning)
            updatePlant(plant.id, { needsWater: true });

            // 3. Simpan key ke LocalStorage
            localStorage.setItem(notifKey, 'true');
            
            // 4. Bersihkan localStorage lama
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];
            localStorage.removeItem(`notif-${plant.id}-${currentTime}-${yesterdayDate}`);
          }
        }
      });
    };

    const intervalId = setInterval(checkSchedules, 10000);

    return () => clearInterval(intervalId);
  }, [plants, isAuthenticated]); 

  // --- LOGIC ALARM SELESAI ---
  
  // ----------------------------------------------------
  // PERUBAHAN UTAMA: Real-time Subscription dan Catch-Up Logic
  // ----------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !session?.user?.id) {
        setPlants([]); 
        return;
    }

    const checkMissedSchedulesAndFetch = async () => {
        // 1. Fetch data awal dari database
        const { data, error } = await supabase.from('plants').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error(error);
            setPlants([]);
            return;
        }
        
        const now = new Date();
        // Total menit hari ini (misal 09:30 = 9*60 + 30 = 570)
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        const todayDate = now.toISOString().split('T')[0];
        
        let updatesNeeded = [];
        
        // CATCH-UP LOGIC: Cek setiap tanaman untuk jadwal yang terlewat
        const updatedPlants = (data || []).map(plant => {
            // Jika sudah needsWater, atau tidak ada jadwal, lewati
            if (!plant.watering_schedule || plant.watering_schedule.length === 0 || plant.needsWater) {
                return plant;
            }

            let needsWaterCheck = false;
            
            // Cek setiap jadwal hari ini
            plant.watering_schedule.forEach(schedTime => {
                const [hour, minute] = schedTime.split(':').map(Number);
                const schedTimeMinutes = hour * 60 + minute;
                
                // Jika jadwal sudah lewat hari ini (waktu saat ini > jadwal)
                if (schedTimeMinutes <= currentTimeMinutes) {
                    // Cek LocalStorage key yang sama dengan yang digunakan di setInterval
                    const notifKey = `notif-${plant.id}-${schedTime}-${todayDate}`;
                    const alreadyNotifiedToday = localStorage.getItem(notifKey);
                    
                    // Jika jadwal terlewat DAN belum ada notifikasi hari ini (berarti missed)
                    if (!alreadyNotifiedToday) {
                        needsWaterCheck = true;
                        updatesNeeded.push({ id: plant.id, needsWater: true });
                        // Set LocalStorage key untuk mencegah re-trigger pada interval
                        localStorage.setItem(notifKey, 'true');
                        // Tidak perlu notifikasi browser saat catch-up load
                    }
                }
            });

            if (needsWaterCheck) {
                // Update needsWater: true di state lokal segera
                return { ...plant, needsWater: true }; 
            }
            return plant;
        });
        
        // Terapkan state lokal yang sudah diperbarui dengan data catch-up
        setPlants(updatedPlants);

        // 2. Terapkan update ke database untuk status needsWater yang terlewat
        for (const update of updatesNeeded) {
             const { error: updateError } = await supabase.from('plants').update({ needsWater: true }).eq('id', update.id);
             if (updateError) console.error("Failed to update needsWater status on load:", updateError);
        }

    };
    
    // Panggil fungsi catch-up saat login/mount
    checkMissedSchedulesAndFetch();

    // 3. Setup channel Real-time (Untuk sinkronisasi instan setelah Catch-Up)
    const channel = supabase
      .channel('plants_realtime_channel')
      .on('postgres_changes', 
          { 
              event: '*', 
              schema: 'public', 
              table: 'plants',
          }, 
          (payload) => {
            const plant = payload.new || payload.old;
            
            if (plant && plant.user_id === session.user.id) {

              setPlants(prevPlants => {
                switch (payload.eventType) {
                  case 'INSERT':
                    if (!prevPlants.some(p => p.id === plant.id)) {
                      return [plant, ...prevPlants];
                    }
                    return prevPlants;

                  case 'UPDATE':
                    return prevPlants.map(p => 
                      p.id === plant.id ? { ...p, ...payload.new } : p
                    );

                  case 'DELETE':
                    if (selectedPlant && payload.old.id === selectedPlant.id) {
                        setSelectedPlant(null);
                    }
                    return prevPlants.filter(p => p.id !== payload.old.id);
                  
                  default:
                    return prevPlants;
                }
              });
            }
          }
      )
      .subscribe();

    // 4. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };

  }, [isAuthenticated, session?.user?.id, selectedPlant]); 
  
  // refreshData sekarang hanya akan memanggil fetch, sebagai fallback
  const refreshData = () => { /* Now handled by checkMissedSchedulesAndFetch */ };

  // Sederhanakan addPlant, deletePlant, dan updatePlant untuk mengandalkan Real-time Listener
  const addPlant = async (newPlantData) => {
    if (!isAuthenticated) return false;
    try {
      const plantWithUserId = { ...newPlantData, user_id: session.user.id };
      const { error } = await supabase.from('plants').insert(plantWithUserId);
      if (error) throw error;
      
      refreshTotalPlantsCount();
      return true;
    } catch (error) {
      console.error(error); 
      return false;
    }
  };

  const deletePlant = async (plantId) => {
    if (!isAuthenticated) return false;
    
    try {
      const { error } = await supabase.from('plants').delete().eq('id', plantId);
      if (error) throw error;
      refreshTotalPlantsCount();
      return true;
    } catch (error) {
      // Jika gagal, panggil ulang fetch untuk sinkronisasi paksa (fallback)
      // checkMissedSchedulesAndFetch tidak perlu dipanggil di sini karena listener sudah berjalan.
      console.error(error); 
      return false;
    }
  };

  const updatePlant = async (plantId, updates) => {
    if (!isAuthenticated || !plantId) return false;
    
    try {
      const { error } = await supabase.from('plants').update(updates).eq('id', plantId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleDetail = (plant) => setSelectedPlant(plant);
  const handleBack = () => setSelectedPlant(null);
  const navigateTo = (tabName) => { setActiveTab(tabName); setSelectedPlant(null); };

  const value = {
    plants, activeTab, selectedPlant, handleDetail, handleBack, navigateTo, addPlant, deletePlant, updatePlant, refreshData,
  };

  return (
    <PlantDataContext.Provider value={value}>
      {children}
    </PlantDataContext.Provider>
  );
};