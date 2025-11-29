import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, ChevronLeft, ChevronRight, Loader2, Leaf, 
  Filter, ArrowDownNarrowWide, CheckCircle, Droplets
} from 'lucide-react';

// === 1. HOOK DEBOUNCE (Dipercepat ke 300ms) ===
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const ITEMS_PER_PAGE = 6;

const CollectionPage = ({ plants, onDetail, onAddPlant }) => {
  const [searchTermInput, setSearchTermInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchTermInput, 300);
  const [currentPage, setCurrentPage] = useState(1);
  
  // === STATE BARU UNTUK FILTERING DAN SORTING ===
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'water_needed', 'healthy'
  const [sortKey, setSortKey] = useState('newest'); // 'newest', 'name_asc'

  // FILTERING & SORTING LOGIC
  const filteredAndSortedPlants = useMemo(() => {
    let result = plants;
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase().trim();

    // 1. FILTER BERDASARKAN PENCARIAN (Search)
    if (lowerCaseSearchTerm) {
      result = result.filter(plant => 
        plant.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        plant.species.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // 2. FILTER BERDASARKAN STATUS
    if (filterStatus === 'water_needed') {
        // Asumsi: plant.needsWater adalah boolean yang sudah dihitung
      result = result.filter(plant => plant.needsWater); 
    } else if (filterStatus === 'healthy') {
      result = result.filter(plant => !plant.needsWater);
    }

    // 3. SORTING
    result = result.sort((a, b) => {
        // Mengurutkan berdasarkan nama (A-Z)
      if (sortKey === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      // Mengurutkan berdasarkan ID, menganggap ID yang lebih tinggi adalah yang terbaru
      if (sortKey === 'newest') {
        // Convert to string for comparison if IDs are not guaranteed to be numbers
        return String(b.id).localeCompare(String(a.id)); 
      }
      return 0; // Default: tidak ada perubahan urutan (seperti urutan asli dari database)
    });

    return result;
  }, [plants, debouncedSearchTerm, filterStatus, sortKey]);

  // PAGINATION CALCULATION 
  const totalItems = filteredAndSortedPlants.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Reset halaman saat filter, sort, atau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, sortKey]);

  const paginatedPlants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedPlants.slice(startIndex, endIndex);
  }, [filteredAndSortedPlants, currentPage]);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const isSearching = searchTermInput !== debouncedSearchTerm;

  // ANIMASI YANG DIPERCEPAT
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.03, 
        delayChildren: 0.01
      } 
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="px-6 pt-12 pb-32 min-h-screen relative bg-gray-50"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">
            Koleksi<br/>
            <span className="text-green-600">Tanaman</span>
          </h1>
        </div>
        <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-500 shadow-sm border border-gray-100">
          {totalItems} Tanaman
        </span>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-4 sticky top-4 z-30 bg-gray-50 pt-2 -mx-6 px-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama tanaman..." 
            value={searchTermInput}
            onChange={(e) => setSearchTermInput(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-green-500/50 outline-none shadow-sm transition-all focus:shadow-md"
          />
          
          {isSearching ? (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
               <Loader2 className="text-green-500 animate-spin" size={18} />
            </div>
          ) : searchTermInput && (
            <button 
              onClick={() => setSearchTermInput('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      
      {/* === FILTER & SORT BARU === */}
      <div className="flex justify-between items-center mb-6 sticky top-[88px] z-20 bg-gray-50 pb-2 -mx-6 px-6">
          
        {/* Filter Status (Segmented Button) */}
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-200 text-sm">
            {['all', 'healthy', 'water_needed'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`
                        py-1 px-3 rounded-full font-medium transition-colors duration-200 text-xs flex items-center gap-1
                        ${filterStatus === status 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }
                    `}
                >
                    {status === 'all' && <Filter size={14} />}
                    {status === 'healthy' && <CheckCircle size={14} />}
                    {status === 'water_needed' && <Droplets size={14} />}
                    <span className="hidden sm:inline">
                        {status === 'all' ? 'Semua' : status === 'healthy' ? 'Sehat' : 'Perlu Air'}
                    </span>
                    <span className="sm:hidden">
                        {status === 'all' ? '' : status === 'healthy' ? '' : ''}
                    </span>
                </button>
            ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
            <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-full py-1.5 pl-3 pr-8 text-xs font-medium text-gray-700 shadow-sm focus:ring-1 focus:ring-green-500 outline-none cursor-pointer"
            >
                <option value="newest">Terbaru</option>
                <option value="name_asc">Nama (A-Z)</option>
            </select>
            <ArrowDownNarrowWide 
                size={14} 
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
            />
        </div>
      </div>
      {/* === AKHIR FILTER & SORT BARU === */}


      {/* Grid Content */}
      <AnimatePresence mode='wait'>
        <motion.div 
          // Key diubah agar animasi ulang terjadi saat page berubah atau search/filter/sort berubah
          key={currentPage + debouncedSearchTerm + filterStatus + sortKey}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {paginatedPlants.map(plant => (
            <motion.div 
              key={plant.id} 
              variants={item}
              layout
              onClick={() => onDetail(plant)} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group active:scale-95 transition-all duration-200"
            >
              <div className="h-36 bg-gray-100 relative overflow-hidden">
                <img 
                  src={plant.image_url || plant.image} 
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400?text=No+Image" }} 
                  alt={plant.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  loading="lazy"
                />
                
                {/* Badge Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {plant.needsWater && (
                    <span className="bg-blue-500/90 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                      Haus
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-bold text-gray-800 text-sm truncate mb-0.5">{plant.name}</h3>
                <div className="flex items-center gap-1 text-gray-500">
                  {/* Biarkan Leaf kecil sebagai pemisah teks atau ganti dengan logo kecil jika ada */}
                  <Leaf size={10} /> 
                  <p className="text-xs truncate">{plant.species || "Spesies tidak diketahui"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty States */}
      {!isSearching && totalItems === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center text-gray-400"
        >
          {/* Ikon untuk Empty State */}
          <Leaf size={48} className="mb-4 opacity-20" /> 
          <p>{searchTermInput ? "Tidak ditemukan tanaman dengan kriteria tersebut." : "Belum ada tanaman."}</p>
        </motion.div>
      )}

      {/* PAGINASI CEPAT */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-bold text-gray-700">
            {currentPage} <span className="text-gray-400 font-normal">/ {totalPages}</span>
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CollectionPage;