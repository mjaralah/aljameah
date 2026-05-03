
-- Seed default hero slides if empty
INSERT INTO public.hero_slides (title, subtitle, image_url, cta_label, cta_url, sort_order, published)
SELECT * FROM (VALUES
  ('معاً نصنع الأثر', 'جمعية خيرية تعمل على خدمة المجتمع وتمكين أبنائه', NULL, 'تبرع الآن', '/donate', 0, true),
  ('برامجنا التنموية', 'نقدّم برامج متنوعة في التعليم والصحة والتمكين الأسري', NULL, 'استكشف البرامج', '/programs', 1, true),
  ('انضم إلى فريق المتطوعين', 'كن جزءاً من رحلة العطاء وساهم في إحداث التغيير', NULL, 'سجّل كمتطوّع', '/e-services/volunteer', 2, true)
) AS v(title, subtitle, image_url, cta_label, cta_url, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

-- Seed home page_content sections
INSERT INTO public.page_content (page_key, section_key, title, content, data, sort_order, published)
SELECT * FROM (VALUES
  ('home', 'stats', 'إحصائيات سريعة', 'أرقامنا المؤثرة', '{"items":[
    {"icon":"Users","label":"المستفيدون","value":24500},
    {"icon":"Sparkles","label":"البرامج","value":32},
    {"icon":"HandHeart","label":"المتطوعون","value":1250},
    {"icon":"Award","label":"سنوات العطاء","value":12}
  ]}'::jsonb, 0, true),
  ('home', 'about_preview', 'عن الجمعية', 'جمعية تنموية تسعى إلى تمكين المجتمع وتحسين جودة حياة أبنائه عبر برامج نوعية ومستدامة، بشراكات فاعلة محلياً وإقليمياً.', '{"cta_label":"اعرف المزيد","cta_url":"/about"}'::jsonb, 1, true),
  ('home', 'satisfaction', 'مؤشرات رضا المستفيدين', 'صوت المستفيدين هو بوصلة عملنا.', '{"cta_label":"عرض نتائج الاستبيانات","cta_url":"/surveys"}'::jsonb, 2, true),
  ('home', 'volunteer_cta', 'كن متطوعاً معنا', 'انضم إلى فريق المتطوعين وشارك في صنع الأثر الإيجابي في مجتمعك.', '{"cta_label":"سجّل الآن","cta_url":"/e-services/volunteer"}'::jsonb, 3, true)
) AS v(page_key, section_key, title, content, data, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.page_content WHERE page_key='home');

-- Seed governance page_content sections
INSERT INTO public.page_content (page_key, section_key, title, content, data, sort_order, published)
SELECT * FROM (VALUES
  ('governance', 'intro', 'الحوكمة والشفافية', 'نلتزم بأعلى معايير الحوكمة والشفافية في إدارة الجمعية وتمكين الرقابة المؤسسية.', '{}'::jsonb, 0, true),
  ('governance', 'financials', 'المؤشرات المالية', 'ملخص الإيرادات والمصروفات للسنة الحالية', '{"year":2024,"currency":"ريال","total_revenue":4500000,"total_expenses":4200000,"allocation":[
    {"label":"البرامج التنموية","percent":55},
    {"label":"المساعدات الإغاثية","percent":25},
    {"label":"المصاريف التشغيلية","percent":15},
    {"label":"الاستثمار والاحتياطي","percent":5}
  ]}'::jsonb, 1, true)
) AS v(page_key, section_key, title, content, data, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.page_content WHERE page_key='governance');
