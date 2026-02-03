import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These should be in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are available
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('⚠️ Supabase غير مُعد. التطبيق يعمل في الوضع المحلي (بدون قاعدة بيانات).');
    console.warn('لتفعيل Supabase، أنشئ ملف .env.local وأضف:');
    console.warn('VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase = supabaseInstance;
