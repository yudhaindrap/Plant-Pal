import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import { Droplets, MapPin, Leaf, CheckCircle, Loader2 } from 'lucide-react';
import { usePlantData } from '../context/PlantDataContext';

// --- Komponen Pembantu: PlantCard (Idealnya di src/components/PlantCard.jsx) ---
// Saya satukan di sini untuk kemudahan Anda
const PlantCard = ({ plant, onClick, onWatered, isUpdating }) => {
    // Tentukan ikon tombol aksi cepat
    const buttonIcon = isUpdating ? (
        <Loader2 size={20} className="animate-spin" />
    ) : (
        <CheckCircle size={20} />
    );

    return (
        <motion.div 
            // Tambahkan key di sini jika Anda memisahkannya
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
        >
            {/* Bagian yang bisa di-klik untuk melihat detail */}
            <div onClick={() => onClick(plant)} className="flex items-center flex-1 cursor-pointer">
                <img 
                    src={plant.image_url || 'https://placehold.co/64x64/D9F7E0/0E842D?text=P'} 
                    alt={plant.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/D9F7E0/0E842D?text=P'; }}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm" 
                />
                <div className="flex-1 ml-4 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{plant.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={12} /> {plant.location || 'Tidak Diketahui'}
                    </p>
                </div>
            </div>
            
            {/* Tombol Aksi Cepat: Tandai Sudah Disiram (Update CRUD) */}
            <button 
                onClick={() => onWatered(plant.id)}
                disabled={isUpdating}
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Tandai sudah disiram"
            >
                {buttonIcon}
            </button>
        </motion.div>
    );
};

// --- Komponen Utama: HomePage ---
const HomePage = ({ plants, user, onDetail }) => {
    // Mengambil fungsi updatePlant dan navigateTo dari context
    const { updatePlant, navigateTo } = usePlantData();
    const [updatingId, setUpdatingId] = useState(null);

    // Filter tanaman yang butuh air
    const tasks = plants.filter(p => p.needsWater);

    // Fungsi untuk menandai tanaman sudah disiram (UPDATE CRUD)
    const handleWatered = async (plantId) => {
        setUpdatingId(plantId);
        
        // Data yang di-update: needsWater menjadi false, dan perbarui waktu air terakhir
        const updates = { 
            needsWater: false,
            last_watered_at: new Date().toISOString()
        };

        const success = await updatePlant(plantId, updates);
        
        if (!success) {
            console.error('Gagal memperbarui status siram.');
            // Implementasi Toast/Notifikasi jika ada
        }

        setUpdatingId(null);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="pb-24"
        >
            {/* Header Modern */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 text-white p-8 rounded-b-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
                {/* Dekorasi Background */}
                <Leaf className="absolute -right-10 -top-10 text-white/10 w-48 h-48 rotate-12" />
                
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Halo, Plant Lovers!</p>
                        <h1 className="text-3xl font-bold tracking-tight">{user?.name || 'Teman'}</h1>
                    </div>
                    {/* Avatar Pengguna */}
                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-md">
                        <img 
                            src={user?.avatar || 'https://placehold.co/48x48/D9F7E0/0E842D?text=U'} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full border-2 border-white/50 object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/D9F7E0/0E842D?text=U'; }}
                        />
                    </div>
                </div>

                {/* Stats Card Floating */}
                <div className="mt-6 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-xs text-green-50 mb-1 font-medium">Perlu Disiram Hari Ini</p>
                        <p className="text-3xl font-bold">{tasks.length} <span className="text-sm font-normal opacity-80">Tanaman</span></p>
                    </div>
                    <div className="bg-white text-green-700 p-3 rounded-full shadow-md">
                        <Droplets size={24} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Content List: Jadwal Prioritas */}
            <div className="px-6">
                <h2 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                    <Droplets size={24} className="text-red-500" /> Jadwal Prioritas (Disiram)
                </h2>
                
                {tasks.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.map((plant) => (
                            <PlantCard 
                                key={plant.id}
                                plant={plant}
                                onClick={onDetail}
                                onWatered={handleWatered}
                                isUpdating={updatingId === plant.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100 shadow-inner">
                        <Leaf className="mx-auto text-green-400 mb-3" size={48} />
                        <h3 className="text-green-800 font-bold">Semua Segar!</h3>
                        <p className="text-green-600 text-sm">Tidak ada jadwal penyiraman saat ini. Cek koleksi Anda.</p>
                        <button 
                            onClick={() => navigateTo('collection')}
                            className="mt-4 px-4 py-2 bg-green-200 text-green-800 rounded-full text-sm font-medium hover:bg-green-300 transition-colors"
                        >
                            Lihat Semua Koleksi
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default HomePage;