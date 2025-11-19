import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';

const CollectionPage = ({ plants, onDetail }) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="px-6 pt-12 pb-24"
    >
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Koleksi<br/><span className="text-green-600">Tanaman</span></h1>
        <span className="text-gray-400 text-sm font-medium">{plants.length} Item</span>
      </div>
      
      {/* Search Bar Visual */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari tanaman..." 
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
        />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4"
      >
        {plants.map(plant => (
          <motion.div 
            key={plant.id} 
            variants={item}
            whileHover={{ y: -5 }}
            onClick={() => onDetail(plant)} 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group"
          >
            <div className="h-36 bg-gray-100 relative overflow-hidden">
              <img 
                src={plant.image_url || plant.image} 
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400?text=No+Image" }} 
                alt={plant.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              {plant.needsWater && (
                <div className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">
                  Haus
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-sm truncate">{plant.name}</h3>
              <p className="text-xs text-gray-500 truncate">{plant.species}</p>
            </div>
          </motion.div>
        ))}
        
        {/* Empty State Helper */}
        {plants.length === 0 && (
          <div className="col-span-2 py-10 text-center text-gray-400">
            Belum ada tanaman.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CollectionPage;