
-- جدول أعمدة التذييل
CREATE TABLE public.footer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title_ar text,
  title_en text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads footer sections"
  ON public.footer_sections FOR SELECT
  USING ((published = true) OR is_staff(auth.uid()));

CREATE POLICY "Staff manage footer sections"
  ON public.footer_sections FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER touch_footer_sections
  BEFORE UPDATE ON public.footer_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER bump_version_footer_sections
  AFTER INSERT OR UPDATE OR DELETE ON public.footer_sections
  FOR EACH STATEMENT EXECUTE FUNCTION public.bump_public_content_version();

-- جدول روابط أعمدة التذييل
CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  label_ar text NOT NULL,
  label_en text,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads footer links"
  ON public.footer_links FOR SELECT
  USING ((published = true) OR is_staff(auth.uid()));

CREATE POLICY "Staff manage footer links"
  ON public.footer_links FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER touch_footer_links
  BEFORE UPDATE ON public.footer_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER bump_version_footer_links
  AFTER INSERT OR UPDATE OR DELETE ON public.footer_links
  FOR EACH STATEMENT EXECUTE FUNCTION public.bump_public_content_version();

-- حقول تعريف الجمعية في إعدادات الموقع
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS footer_brand_name_ar text,
  ADD COLUMN IF NOT EXISTS footer_brand_name_en text,
  ADD COLUMN IF NOT EXISTS footer_brand_tagline_ar text,
  ADD COLUMN IF NOT EXISTS footer_brand_tagline_en text,
  ADD COLUMN IF NOT EXISTS footer_brand_about_ar text,
  ADD COLUMN IF NOT EXISTS footer_brand_about_en text;

-- زرع الأعمدة الافتراضية
INSERT INTO public.footer_sections (section_key, title_ar, title_en, sort_order, published) VALUES
  ('brand',     NULL,                 NULL,               10, true),
  ('quick',     'روابط سريعة',         'Quick Links',       20, true),
  ('eservices', 'الخدمات الإلكترونية', 'E-Services',        30, true),
  ('legal',     'المعلومات القانونية', 'Legal',             40, true),
  ('contact',   'تواصل معنا',          'Contact',           50, true);

-- زرع روابط القائمة "روابط سريعة"
INSERT INTO public.footer_links (section_key, label_ar, label_en, url, sort_order, published) VALUES
  ('quick', 'من نحن',           'About',      '/about',      10, true),
  ('quick', 'البرامج والخدمات', 'Programs',   '/programs',   20, true),
  ('quick', 'الحوكمة',          'Governance', '/governance', 30, true),
  ('quick', 'المركز الإعلامي',  'Media',      '/media',      40, true),
  ('quick', 'الاستبيانات',      'Surveys',    '/surveys',    50, true);

-- زرع روابط قائمة "الخدمات الإلكترونية"
INSERT INTO public.footer_links (section_key, label_ar, label_en, url, sort_order, published) VALUES
  ('eservices', 'الخدمات الإلكترونية', 'E-Services', '/e-services',            10, true),
  ('eservices', 'التطوع',              'Volunteer',  '/e-services/volunteer',  20, true),
  ('eservices', 'العضوية',             'Membership', '/e-services/membership', 30, true);
