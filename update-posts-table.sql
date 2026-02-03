-- =============================================
-- تحديث جدول posts لجعل الحقول اختيارية
-- شغّل هذا السكريبت في Supabase SQL Editor
-- =============================================

-- جعل حقل platform اختياري مع قيمة افتراضية
ALTER TABLE public.posts 
  ALTER COLUMN platform DROP NOT NULL,
  ALTER COLUMN platform SET DEFAULT 'Instagram';

-- جعل حقل date اختياري مع قيمة افتراضية
ALTER TABLE public.posts 
  ALTER COLUMN date DROP NOT NULL,
  ALTER COLUMN date SET DEFAULT timezone('utc'::text, now());

-- ملاحظة: حقل status لديه بالفعل قيمة افتراضية 'Draft'
-- ملاحظة: حقل content اختياري بالفعل (بدون NOT NULL)
