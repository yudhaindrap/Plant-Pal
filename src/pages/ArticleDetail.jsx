import React, { useState } from 'react'; // Import useState
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { ArrowLeft, User, Calendar, X } from 'lucide-react'; // Import X icon

const ArticleDetail = ({ article, onBack }) => {
    // New states for image zooming
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState('');
    
    // Placeholder image
    const placeholderImage = "https://placehold.co/800x400/e2e8f0/1e293b?text=PlantPal+Article";

    // Format tanggal untuk tampilan yang lebih mudah dibaca
    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak tersedia';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Function to handle image zoom
    const handleZoom = (url) => {
        setZoomedImageUrl(url || placeholderImage);
        setIsZoomed(true);
    };

    // --- Zoom Modal Component ---
    const ZoomModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)} // Klik di mana saja menutup modal
        >
            <motion.img
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={zoomedImageUrl}
                alt="Zoomed Article Image"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()} // Mencegah klik gambar menutup modal
            />
            <button
                className="absolute top-4 right-4 p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors"
                aria-label="Tutup zoom"
                onClick={() => setIsZoomed(false)}
            >
                <X size={24} />
            </button>
        </motion.div>
    );


    return (
        <>
            <motion.div
                // Animasi untuk transisi yang mulus dari samping kanan (seperti detail pada mobile)
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ duration: 0.3 }}
                className="p-0 pb-20 md:pb-6 bg-gray-50 min-h-full overflow-y-auto"
            >
                {/* Header Sticky dengan Tombol Kembali */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 shadow-sm flex items-center">
                    <button 
                        onClick={onBack}
                        className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors p-2 -ml-2 rounded-full hover:bg-green-50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800 ml-4 truncate">
                        {article.title}
                    </h2>
                </div>
                
                {/* Konten Utama Artikel */}
                <div className="p-6">
                    {/* Gambar Utama - Dibuat dapat di-klik untuk zoom */}
                    <div 
                        className="w-full h-60 bg-gray-100 rounded-xl mb-6 shadow-md overflow-hidden cursor-zoom-in group relative"
                        onClick={() => handleZoom(article.image_url)}
                        role="button"
                        aria-label={`Zoom gambar: ${article.title}`}
                    >
                        <img 
                            src={article.image_url || placeholderImage} 
                            alt={article.title} 
                            onError={(e) => { e.target.src = placeholderImage; }}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        {/* Overlay untuk indikasi zoom */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2 bg-white/80 rounded-full shadow-lg text-gray-800 backdrop-blur-sm text-sm font-semibold">
                                Ketuk untuk Zoom
                            </span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-snug">
                        {article.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-x-4 gap-y-2">
                        {/* Author */}
                        <span className="flex items-center font-medium">
                            <User size={14} className="mr-1 text-green-500" />
                            {article.author || 'PlantPal Admin'}
                        </span>
                        
                        {/* Tanggal */}
                        <span className="flex items-center">
                            <Calendar size={14} className="mr-1 text-green-500" />
                            {formatDate(article.published_at)}
                        </span>
                        
                        {/* Tags */}
                        {article.tags && article.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Konten Artikel Lengkap */}
                    <div className="prose max-w-none text-gray-700 leading-relaxed text-justify">
                        {/* ⚠️ PENTING: Menggunakan dangerouslySetInnerHTML untuk merender HTML/Markdown
                                yang tersimpan di kolom 'content'. Pastikan konten yang Anda masukkan 
                                melalui Supabase aman dan terpercaya! */}
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>
                </div>

            </motion.div>

            {/* Modal Zoom ditampilkan menggunakan AnimatePresence */}
            <AnimatePresence>
                {isZoomed && <ZoomModal />}
            </AnimatePresence>
        </>
    );
};

export default ArticleDetail;