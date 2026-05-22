INSERT INTO public.about_content (section_key, title, content, data, sort_order, published)
VALUES (
  'board',
  'أعضاء مجلس الإدارة',
  'نخبةٌ من الكفاءات المتطوّعة لخدمة رسالة الجمعية، يُمثّلون تنوعاً في الخبرات والتخصصات.',
  '{}'::jsonb,
  85,
  true
)
ON CONFLICT (section_key) DO NOTHING;