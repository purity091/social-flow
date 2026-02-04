-- إضافة أعمدة جديدة لجدول design_studios
-- يجب تشغيل هذا السكربت في Supabase SQL Editor

-- إضافة عمود تصنيف حجم الصورة
ALTER TABLE design_studios 
ADD COLUMN IF NOT EXISTS image_size TEXT;

-- إضافة عمود نصائح الاستخدام
ALTER TABLE design_studios 
ADD COLUMN IF NOT EXISTS usage_tips TEXT;

-- إضافة تعليق توضيحي للأعمدة الجديدة
COMMENT ON COLUMN design_studios.image_size IS 'تصنيف حجم الصورة (مثل: 1080x1080، 1200x628، Story 9:16)';
COMMENT ON COLUMN design_studios.usage_tips IS 'نصائح تفصيلية حول كيفية استخدام الاستديو';
