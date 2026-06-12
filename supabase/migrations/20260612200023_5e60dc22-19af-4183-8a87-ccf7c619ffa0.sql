
CREATE TABLE public.header_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE,
  kind text NOT NULL DEFAULT 'system' CHECK (kind IN ('system','custom')),
  label_ar text,
  label_en text,
  url text NOT NULL,
  is_external boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.header_menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.header_menu_items TO authenticated;
GRANT ALL ON public.header_menu_items TO service_role;

ALTER TABLE public.header_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible header menu items"
ON public.header_menu_items FOR SELECT
USING (is_visible = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage header menu items"
ON public.header_menu_items FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_header_menu_items_touch
BEFORE UPDATE ON public.header_menu_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_header_menu_items_bump
AFTER INSERT OR UPDATE OR DELETE ON public.header_menu_items
FOR EACH STATEMENT EXECUTE FUNCTION public.bump_public_content_version();

-- Seed system items
INSERT INTO public.header_menu_items (key, kind, label_ar, label_en, url, sort_order) VALUES
  ('home',       'system', 'الرئيسية',          'Home',         '/',           10),
  ('about',      'system', 'من نحن',            'About',        '/about',      20),
  ('programs',   'system', 'البرامج',            'Programs',     '/programs',   30),
  ('governance', 'system', 'الحوكمة',           'Governance',   '/governance', 40),
  ('media',      'system', 'المركز الإعلامي',    'Media',        '/media',      50),
  ('eservices',  'system', 'الخدمات الإلكترونية', 'E-Services',   '/e-services', 60),
  ('surveys',    'system', 'الاستبيانات',        'Surveys',      '/surveys',    70),
  ('contact',    'system', 'تواصل معنا',         'Contact',      '/contact',    80),
  ('support',    'system', 'الدعم والمساعدة',     'Support',      '/support',    90);
