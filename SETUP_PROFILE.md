# Setup Fitur Edit Profil - Panduan Lengkap

Dokumen ini menjelaskan langkah-langkah untuk mengaktifkan fitur edit profil di aplikasi PlantPal.

## 📋 Daftar Isi
1. [Setup Database](#1-setup-database)
2. [Setup Storage Bucket](#2-setup-storage-bucket)
3. [Testing Fitur](#3-testing-fitur)
4. [Troubleshooting](#4-troubleshooting)

## 1. Setup Database

### Langkah 1: Buka Supabase Dashboard
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan SQL Script
1. Copy seluruh isi file `supabase_setup.sql` yang ada di root project
2. Paste ke SQL Editor
3. Klik tombol **Run** untuk mengeksekusi script

Script ini akan:
- ✅ Membuat tabel `user_profiles` untuk menyimpan data profil
- ✅ Menambahkan kolom: `display_name`, `bio`, `profile_photo_url`
- ✅ Mengaktifkan Row Level Security (RLS) untuk keamanan
- ✅ Membuat policies agar user hanya bisa edit profil sendiri
- ✅ Membuat trigger untuk auto-create profil saat user baru register
- ✅ Membuat trigger untuk auto-update timestamp

### Langkah 3: Verifikasi Tabel
1. Klik menu **Table Editor** di sidebar
2. Pastikan tabel `user_profiles` sudah muncul
3. Cek struktur tabel memiliki kolom:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key ke auth.users)
   - `display_name` (text)
   - `bio` (text)
   - `profile_photo_url` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 2. Setup Storage Bucket

### Langkah 1: Buat Bucket Baru
1. Klik menu **Storage** di sidebar Supabase Dashboard
2. Klik tombol **New bucket**
3. Isi form:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Centang (agar foto bisa diakses publik)
4. Klik **Create bucket**

### Langkah 2: Setup Storage Policies
1. Pilih bucket `profile-photos` yang baru dibuat
2. Klik tab **Policies**
3. Tambahkan 4 policies berikut:

#### Policy 1: Select (Read)
- **Policy name**: `Public can view profile photos`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**: 
  ```sql
  true
  ```

#### Policy 2: Insert (Upload)
- **Policy name**: `Authenticated users can upload own photos`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**: 
  ```sql
  (bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

#### Policy 3: Update
- **Policy name**: `Users can update own photos`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**: 
  ```sql
  (bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

#### Policy 4: Delete
- **Policy name**: `Users can delete own photos`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**: 
  ```sql
  (bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
  ```

### Langkah 3: Verifikasi Storage
1. Coba upload file test via dashboard Storage
2. Pastikan file bisa diupload dan muncul di bucket
3. Cek public URL bisa diakses

## 3. Testing Fitur

### Test Manual via Aplikasi

1. **Test Edit Nama**
   - Login ke aplikasi
   - Buka halaman Profil
   - Klik tombol Edit (icon pensil di pojok kanan atas)
   - Ubah nama di field input
   - Klik "Simpan Profil"
   - Verifikasi nama berubah

2. **Test Edit Bio**
   - Masih di mode edit
   - Isi textarea Bio dengan teks (max 1000 karakter)
   - Klik "Simpan Profil"
   - Verifikasi bio muncul di halaman profil

3. **Test Upload Foto**
   - Masih di mode edit
   - Klik icon kamera di foto profil
   - Pilih file gambar (JPEG/PNG, max 2MB)
   - Preview foto akan muncul
   - Klik "Simpan Profil"
   - Verifikasi foto profil berubah

4. **Test Validasi**
   - Coba upload file > 2MB (harus ditolak)
   - Coba upload file bukan gambar (harus ditolak)
   - Coba isi bio > 1000 karakter (harus ditolak)

### Test Security

1. **Test RLS (Row Level Security)**
   - Login dengan User A
   - Edit profil User A (harus berhasil)
   - Logout
   - Login dengan User B
   - Coba akses/edit profil User A via API (harus gagal)

2. **Test Storage Security**
   - Upload foto sebagai User A
   - Logout
   - Login sebagai User B
   - Coba hapus/edit foto User A via Storage (harus gagal)

## 4. Troubleshooting

### Problem: Error "relation user_profiles does not exist"
**Solusi**: 
- Pastikan SQL script sudah dijalankan di Supabase SQL Editor
- Refresh browser dan coba lagi
- Cek di Table Editor apakah tabel `user_profiles` ada

### Problem: Error saat upload foto "Failed to upload"
**Solusi**:
- Pastikan bucket `profile-photos` sudah dibuat
- Cek policies storage sudah benar
- Pastikan bucket bersifat public
- Cek ukuran file < 2MB dan format JPEG/PNG

### Problem: Foto tidak muncul / broken image
**Solusi**:
- Cek URL foto di tabel `user_profiles`
- Pastikan bucket `profile-photos` bersifat public
- Cek policy SELECT sudah ada dan benar
- Coba akses URL foto langsung di browser

### Problem: "Permission denied" saat save profil
**Solusi**:
- Pastikan RLS policies sudah dibuat dengan benar
- Cek user sudah login (authenticated)
- Verifikasi policy `user_id = auth.uid()` benar

### Problem: Profil tidak ter-create otomatis saat register
**Solusi**:
- Pastikan trigger `on_auth_user_created` sudah dibuat
- Cek fungsi `handle_new_user()` sudah ada
- Untuk user lama, profil akan dibuat otomatis saat pertama kali login setelah fitur ini aktif

## 📝 Catatan Penting

1. **Backup Data**: Selalu backup database sebelum menjalankan SQL script di production
2. **Testing**: Test semua fitur di environment development dulu sebelum ke production
3. **Security**: RLS policies sangat penting untuk keamanan data user
4. **Storage Limit**: Perhatikan storage limit di Supabase plan Anda
5. **Image Optimization**: Pertimbangkan untuk compress gambar di frontend sebelum upload

## 🔗 Referensi

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Triggers Documentation](https://supabase.com/docs/guides/database/postgres/triggers)

## 📞 Support

Jika mengalami kendala, silakan:
1. Cek Console Browser untuk error messages
2. Cek Supabase Logs di Dashboard
3. Review dokumentasi Supabase
4. Create issue di repository ini dengan detail error

---

**Selamat! 🎉** Fitur edit profil sudah siap digunakan!
