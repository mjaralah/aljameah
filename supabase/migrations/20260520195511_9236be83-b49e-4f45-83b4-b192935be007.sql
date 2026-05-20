
-- 1) أعمدة JSON على site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS feedback_visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pages_visibility jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2) أقسام الصفحة الرئيسية الناقصة
INSERT INTO public.page_content (page_key, section_key, title, content, data, sort_order, published)
VALUES
  ('home','hero',          'شريط البطل',         NULL, '{}'::jsonb, 5,  true),
  ('home','programs',      'برامجنا وخدماتنا',   NULL, '{}'::jsonb, 25, true),
  ('home','news',          'آخر الأخبار',        NULL, '{}'::jsonb, 45, true),
  ('home','partners',      'شركاء النجاح',       NULL, '{}'::jsonb, 55, true)
ON CONFLICT DO NOTHING;
