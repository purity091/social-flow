-- =============================================
-- إضافة عمود user_id للجداول الموجودة
-- شغّل هذا السكريبت في Supabase SQL Editor
-- =============================================

-- 1. إضافة عمود user_id لجدول posts
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. إضافة عمود user_id لجدول campaigns
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3. إضافة عمود user_id لجدول media_items
ALTER TABLE public.media_items 
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 4. تحديث البيانات الموجودة (اختياري - ربط المنشورات القديمة بمستخدم معين)
-- استبدل YOUR_USER_ID بـ UUID المستخدم من جدول auth.users
-- UPDATE public.posts SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE public.campaigns SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE public.media_items SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- 5. تفعيل RLS (إذا لم يكن مفعل)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 6. حذف السياسات القديمة (إذا وجدت) وإنشاء جديدة
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- سياسات posts
CREATE POLICY "Users can view their own posts" ON public.posts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts" ON public.posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts 
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns" ON public.campaigns 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own campaigns" ON public.campaigns 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.campaigns 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns 
  FOR DELETE USING (auth.uid() = user_id);

-- سياسات media_items
DROP POLICY IF EXISTS "Users can view their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media_items;

CREATE POLICY "Users can view their own media" ON public.media_items 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own media" ON public.media_items 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON public.media_items 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON public.media_items 
  FOR DELETE USING (auth.uid() = user_id);

-- 7. تحديث schema cache
SELECT pg_notify('pgrst', 'reload schema');
