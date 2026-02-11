-- إضافة عمود حالة لجدول design_studios
-- يجب تشغيل هذا السكربت في Supabase SQL Editor

-- إضافة عمود الحالة مع قيم محددة
ALTER TABLE design_studios
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'under_development'));

-- إضافة تعليق توضيحي للعمود الجديد
COMMENT ON COLUMN design_studios.status IS 'حالة الاستديو: ready (جاهز للاستخدام) أو under_development (تحت التطوير)';