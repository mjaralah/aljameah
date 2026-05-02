-- Generic page content table for sections of public pages (contact, eservices, media, etc.)
CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT,
  data JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads page content"
  ON public.page_content FOR SELECT
  TO anon, authenticated
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff manage page content"
  ON public.page_content FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER page_content_touch
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default sections so admin sees editable rows immediately
INSERT INTO public.page_content (page_key, section_key, title, content, data, sort_order) VALUES
  ('contact', 'intro', 'تواصل معنا', 'يسعدنا تواصلكم معنا عبر القنوات التالية', NULL, 0),
  ('contact', 'hours', 'ساعات العمل', 'الأحد - الخميس: 8:00 ص - 4:00 م', NULL, 1),
  ('contact', 'map', 'الموقع على الخريطة', NULL, '{"embed_url":"","address":""}'::jsonb, 2),
  ('eservices', 'intro', 'الخدمات الإلكترونية', 'باقة من الخدمات الإلكترونية المتاحة للمستفيدين والمتطوعين', NULL, 0),
  ('eservices', 'services_list', 'الخدمات المتاحة', NULL, '{"items":[{"title":"طلب عضوية","description":"انضم إلينا كعضو","url":"/eservices/membership","icon":"UserPlus"},{"title":"التطوع","description":"سجل كمتطوع","url":"/eservices/volunteer","icon":"HandHeart"}]}'::jsonb, 1),
  ('media', 'intro', 'المركز الإعلامي', 'آخر الأخبار والتغطيات الإعلامية للجمعية', NULL, 0),
  ('media', 'sections', 'الأقسام', NULL, '{"items":[{"title":"الأخبار","description":"آخر أخبار الجمعية"},{"title":"المعرض","description":"صور من فعالياتنا"}]}'::jsonb, 1)
ON CONFLICT (page_key, section_key) DO NOTHING;