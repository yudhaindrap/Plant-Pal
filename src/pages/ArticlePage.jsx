import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { BookOpen, Search, Clock, ChevronRight, Loader2 } from 'lucide-react'; 
import ArticleDetail from './ArticleDetail.jsx';

// === 1. HOOK DEBOUNCE ===
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


// ArticleCard component
const ArticleCard = ({ article, onClick }) => {
    // Placeholder image jika image_url kosong atau error
    const placeholderImage = "https://placehold.co/400x400/e2e8f0/1e293b?text=PlantPal";

    return (
        <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
        >
            {/* Image Thumbnail */}
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                <img 
                    src={article.image_url || placeholderImage} 
                    alt={article.title}
                    onError={(e) => { e.target.src = placeholderImage; }} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                    {/* Tags (ambil tag pertama saja) */}
                    {article.tags && article.tags[0] && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">
                            {article.tags[0]}
                        </span>
                    )}
                    
                    <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1">
                        {article.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {article.summary}
                    </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-[10px] text-gray-400 gap-1">
                        <Clock size={10} />
                        <span>
                            {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                </div>
            </div>
        </motion.div>
    );
};


const ArticlePage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    
    // States untuk Search
    const [searchTermInput, setSearchTermInput] = useState('');
    const debouncedSearchTerm = useDebounce(searchTermInput, 300);
    // State sortKey dihapus, default sorting tetap newest
    
    const fetchArticles = async () => {
        setLoading(true);
        try {
            // Fetch articles dan tetap diurutkan berdasarkan tanggal terbaru
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('published_at', { ascending: false }); 
            
            if (error) throw error;
            setArticles(data || []);
        } catch (err) {
            setError('Gagal memuat artikel. Periksa koneksi internet Anda.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // FILTERING LOGIC (Hanya berdasarkan Search)
    const filteredArticles = useMemo(() => {
        let result = articles;
        const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase().trim();

        // 1. FILTER BERDASARKAN PENCARIAN (Search)
        if (lowerCaseSearchTerm) {
            result = result.filter(article => 
                article.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                article.summary.toLowerCase().includes(lowerCaseSearchTerm) ||
                article.tags?.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        // Karena default fetch sudah sorted by 'published_at', tidak perlu sorting lagi di sini.
        return result;
    }, [articles, debouncedSearchTerm]);
    
    const isSearching = searchTermInput !== debouncedSearchTerm;


    if (selectedArticle) {
        return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 pt-12 pb-32 min-h-screen relative bg-gray-50" 
        >
            {/* === MAIN HEADER & SEARCH AREA === */}
            <div className="pt-6 pb-4 md:px-0 pt-0">
                
                {/* Judul Halaman */}
                <div className="flex items-center gap-3 mb-4 md:pt-0">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Artikel Tanaman</h1>
                        <p className="text-xs text-gray-500">Panduan & Tips Perawatan</p>
                    </div>
                </div>

                {/* Search Bar (Sticky) */}
                {/* Ini adalah satu-satunya elemen kontrol di bawah header utama */}
                <div className="relative mb-4 sticky top-0 z-30 bg-gray-50 pt-2 -mx-6 px-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau tag artikel..." 
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
            </div>

            {/* Content Area */}
            {/* Padding horizontal hanya untuk mobile (px-6) */}
            <div className="space-y-4 px-0">
                {loading ? (
                    // Skeleton loader
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl shadow-sm animate-pulse flex gap-4 h-28">
                            <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
                            </div>
                        </div>
                    ))
                ) : error ? (
                    // Error state
                    <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl border border-red-100">
                        <p>{error}</p>
                    </div>
                ) : filteredArticles.length > 0 ? (
                    // Article list
                    filteredArticles.map((article) => (
                        <ArticleCard 
                            key={article.id} 
                            article={article} 
                            onClick={() => setSelectedArticle(article)} 
                        />
                    ))
                ) : (
                    // Empty state
                    <div className="text-center py-12 text-gray-400">
                        <p>Tidak ada artikel yang ditemukan untuk kriteria ini.</p>
                    </div>
                )}
            </div>
            
            {/* Jarak di bawah untuk mobile nav bar */}
            <div className="md:hidden h-20" /> 
        </motion.div>
    );
};

export default ArticlePage;