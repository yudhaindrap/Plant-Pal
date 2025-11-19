import { createClient } from '@supabase/supabase-js';

// Pastikan membaca VITE_ dari environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Logika error Anda berasal dari baris di bawah ini,
// jika supabaseUrl dan supabaseAnonKey masih kosong/undefined.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);