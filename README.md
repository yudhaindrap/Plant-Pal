# PlantPal - Aplikasi Manajemen Tanaman

Aplikasi Progressive Web App (PWA) untuk mengelola koleksi tanaman pribadi dengan fitur perawatan dan profil pengguna.

## 🌟 Fitur Utama

- 🌱 **Manajemen Tanaman** - Tambah, lihat, edit, dan hapus tanaman dalam koleksi
- 📝 **Log Perawatan** - Catat aktivitas perawatan tanaman
- 👤 **Profil Pengguna** - Edit nama, bio, dan foto profil
- 🔐 **Autentikasi** - Login aman dengan Supabase Auth
- 📱 **PWA** - Dapat diinstall sebagai aplikasi mobile
- 🎨 **UI Responsif** - Tampilan optimal di mobile dan desktop

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 atau lebih baru)
- npm atau yarn
- Akun Supabase (untuk backend)

### Instalasi

1. Clone repository
```bash
git clone https://github.com/yudhaindrap/TA-PRAKPPB.git
cd TA-PRAKPPB
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Supabase Anda:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Setup database Supabase
- Buka Supabase Dashboard → SQL Editor
- Jalankan script dari `supabase_setup.sql`
- Lihat panduan lengkap di `SETUP_PROFILE.md`

5. Jalankan development server
```bash
npm run dev
```

6. Buka browser di `http://localhost:5173`

## 📁 Struktur Project

```
TA-PRAKPPB/
├── src/
│   ├── components/        # Komponen React reusable
│   ├── context/          # React Context (Auth, PlantData)
│   ├── pages/            # Halaman aplikasi
│   ├── services/         # Service layer untuk API calls
│   ├── assets/           # Gambar dan asset statis
│   └── main.jsx          # Entry point aplikasi
├── public/               # Asset publik
├── supabase_setup.sql    # SQL script untuk setup database
├── SETUP_PROFILE.md      # Panduan setup fitur profil
└── package.json
```

## 🔧 Teknologi

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **PWA**: Vite Plugin PWA

## 📸 Fitur Edit Profil

### Setup

Untuk mengaktifkan fitur edit profil, ikuti langkah di `SETUP_PROFILE.md`:

1. Jalankan SQL script `supabase_setup.sql`
2. Buat Storage bucket `profile-photos`
3. Setup policies untuk keamanan

### Fitur

- ✏️ Edit nama display
- 📝 Tambah/edit bio (max 1000 karakter)
- 📷 Upload foto profil (JPEG/PNG, max 2MB)
- 🔒 Row Level Security untuk keamanan data
- ✅ Validasi file dan input
- 🎨 UI inline tanpa mengubah tampilan

## 🏗️ Development

### Build untuk Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## 🐛 Troubleshooting

Lihat `SETUP_PROFILE.md` untuk panduan troubleshooting lengkap.

### Error: "relation user_profiles does not exist"
- Pastikan SQL script sudah dijalankan di Supabase
- Refresh database dan coba lagi

### Error: "Failed to upload photo"
- Pastikan bucket `profile-photos` sudah dibuat
- Cek policies storage sudah benar
- Pastikan file < 2MB dan format JPEG/PNG

## 📝 License

MIT License - lihat file LICENSE untuk detail.

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di GitHub repository.

---

Built with ❤️ using React + Vite + Supabase
