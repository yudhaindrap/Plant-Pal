import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Github, Heart } from 'lucide-react';

const ProfilePage = ({ user, onLogout }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="pb-24 bg-gray-50 min-h-screen"
    >
      <div className="bg-gray-900 text-white pt-16 pb-12 px-6 rounded-b-[3rem] text-center shadow-2xl">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-28 h-28 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mx-auto mb-4 p-1"
        >
          <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full border-4 border-gray-900" />
        </motion.div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-400 text-sm font-mono">{user.email}</p>
      </div>

      <div className="px-6 -mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex justify-around text-center divide-x divide-gray-100">
            <div>
              <p className="text-2xl font-bold text-green-600">{user.totalPlants || 0}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Tanaman</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Log Rawat</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">

          <div className="flex items-center justify-between w-full bg-white p-4 rounded-xl border border-gray-200 text-gray-700">
             <span className="flex items-center gap-3 font-medium">
                <Heart size={20} className="text-red-500" /> Versi Aplikasi
             </span>
             <span className="text-xs bg-gray-100 px-2 py-1 rounded">v1.0.0 PWA</span>
          </div>

          <button 
            onClick={onLogout}
            className="w-full bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 font-bold flex items-center justify-center gap-2 mt-6 hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            Keluar Akun
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;