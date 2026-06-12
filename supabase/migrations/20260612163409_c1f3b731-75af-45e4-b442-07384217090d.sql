
-- 1) support_settings (single row)
CREATE TABLE public.support_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  page_title text NOT NULL DEFAULT 'الدعم والمساعدة',
  page_subtitle text NOT NULL DEFAULT 'كيف يمكننا مساعدتك اليوم؟',
  search_placeholder text NOT NULL DEFAULT 'ابحث عن سؤالك...',
  contact_form_enabled boolean NOT NULL DEFAULT true,
  contact_form_title text NOT NULL DEFAULT 'لم تجد إجابة؟ تواصل معنا',
  quick_links_title text NOT NULL DEFAULT 'روابط سريعة',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_settings TO anon, authenticated;
GRANT ALL ON public.support_settings TO service_role;
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_settings_read_all" ON public.support_settings FOR SELECT USING (true);
CREATE POLICY "support_settings_admin_write" ON public.support_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER support_settings_touch BEFORE UPDATE ON public.support_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.support_settings (id) VALUES (true);

-- 2) support_categories
CREATE TABLE public.support_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'HelpCircle',
  color text NOT NULL DEFAULT 'primary',
  link text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.support_categories TO authenticated;
GRANT ALL ON public.support_categories TO service_role;
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_categories_read_published" ON public.support_categories FOR SELECT
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "support_categories_admin_write" ON public.support_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER support_categories_touch BEFORE UPDATE ON public.support_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) support_faqs
CREATE TABLE public.support_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.support_categories(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.support_faqs TO authenticated;
GRANT ALL ON public.support_faqs TO service_role;
ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_faqs_read_published" ON public.support_faqs FOR SELECT
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "support_faqs_admin_write" ON public.support_faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER support_faqs_touch BEFORE UPDATE ON public.support_faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4) support_quick_links
CREATE TABLE public.support_quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  description text,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'ExternalLink',
  link_type text NOT NULL DEFAULT 'link',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_quick_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.support_quick_links TO authenticated;
GRANT ALL ON public.support_quick_links TO service_role;
ALTER TABLE public.support_quick_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_quick_links_read_published" ON public.support_quick_links FOR SELECT
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "support_quick_links_admin_write" ON public.support_quick_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER support_quick_links_touch BEFORE UPDATE ON public.support_quick_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial categories
INSERT INTO public.support_categories (label, description, icon, color, link, sort_order) VALUES
  ('العضوية', 'الانضمام للجمعية وإدارة العضوية', 'IdCard', 'blue', '/e-services/membership', 1),
  ('التطوع', 'فرص التطوع والتسجيل', 'HandHeart', 'green', '/e-services/volunteer', 2),
  ('الخدمات الإلكترونية', 'النماذج والخدمات', 'ClipboardList', 'purple', '/e-services', 3),
  ('الفعاليات والبرامج', 'المشاركة في برامجنا', 'FolderKanban', 'orange', '/programs', 4),
  ('الحوكمة والشفافية', 'الوثائق واللوائح', 'ScrollText', 'amber', '/governance', 5),
  ('التواصل', 'كيفية التواصل معنا', 'MessageSquare', 'rose', '/contact', 6);

-- Seed initial FAQs (using subqueries to get category ids)
INSERT INTO public.support_faqs (category_id, question, answer, keywords, sort_order) VALUES
  ((SELECT id FROM public.support_categories WHERE label='العضوية'),
    'كيف يمكنني التقديم على عضوية الجمعية؟',
    'يمكنك التقديم عبر صفحة الخدمات الإلكترونية ثم اختيار "طلب عضوية"، تعبئة النموذج وإرفاق المستندات المطلوبة، ثم سيتم مراجعة طلبك خلال أيام عمل قليلة وإشعارك بالنتيجة عبر البريد الإلكتروني.',
    ARRAY['عضوية','تسجيل','انضمام','اشتراك'], 1),
  ((SELECT id FROM public.support_categories WHERE label='العضوية'),
    'ما هي شروط العضوية ورسومها؟',
    'تختلف الشروط حسب نوع العضوية (عامل، منتسب، فخري). يمكنك الاطلاع على التفاصيل الكاملة في صفحة العضوية، وتشمل عادة: الأهلية القانونية، الالتزام بالنظام الأساسي، وسداد الرسوم السنوية.',
    ARRAY['شروط','رسوم','تكلفة','اشتراك سنوي'], 2),
  ((SELECT id FROM public.support_categories WHERE label='العضوية'),
    'كيف أجدد عضويتي؟',
    'التجديد متاح سنوياً عبر بوابة العضو، أو بالتواصل مع إدارة العضوية. ستصلك رسالة تذكير قبل انتهاء العضوية بشهر.',
    ARRAY['تجديد','عضوية منتهية'], 3),
  ((SELECT id FROM public.support_categories WHERE label='التطوع'),
    'كيف يمكنني التطوع مع الجمعية؟',
    'ادخل على صفحة التطوع من قائمة الخدمات الإلكترونية، عبّئ نموذج التطوع موضحاً مهاراتك وأوقات توفرك، وسيتم التواصل معك عند توفر فرصة مناسبة.',
    ARRAY['تطوع','متطوع','مساعدة','مشاركة'], 1),
  ((SELECT id FROM public.support_categories WHERE label='التطوع'),
    'هل هناك شروط للتطوع؟',
    'الشروط الأساسية: أن يكون عمرك 16 سنة فأكثر، والالتزام بميثاق المتطوعين. بعض الفرص قد تتطلب مهارات أو خبرات محددة.',
    ARRAY['شروط تطوع','عمر','مؤهلات'], 2),
  ((SELECT id FROM public.support_categories WHERE label='التطوع'),
    'هل أحصل على شهادة تطوع؟',
    'نعم، تمنح الجمعية شهادات تطوع موثقة بعد إتمام عدد محدد من الساعات التطوعية، ويمكن طلبها من إدارة المتطوعين.',
    ARRAY['شهادة','توثيق ساعات'], 3),
  ((SELECT id FROM public.support_categories WHERE label='الخدمات الإلكترونية'),
    'ما الخدمات الإلكترونية المتاحة؟',
    'نوفر مجموعة من الخدمات أونلاين منها: طلب العضوية، التطوع، طلب الدعم، تقديم الشكاوى والمقترحات، والاستبيانات. اطلع على القائمة الكاملة في صفحة الخدمات الإلكترونية.',
    ARRAY['خدمات','نماذج','أونلاين'], 1),
  ((SELECT id FROM public.support_categories WHERE label='الخدمات الإلكترونية'),
    'كم يستغرق الرد على الطلبات؟',
    'نحرص على الرد خلال 3 إلى 5 أيام عمل. الطلبات العاجلة يمكن متابعتها عبر التواصل المباشر مع الجمعية.',
    ARRAY['مدة','رد','معالجة طلب'], 2),
  ((SELECT id FROM public.support_categories WHERE label='الفعاليات والبرامج'),
    'كيف أعرف بالفعاليات القادمة؟',
    'تابع صفحة "البرامج والفعاليات" وصفحة الأخبار في الموقع، أو اشترك في النشرة البريدية ليصلك كل جديد.',
    ARRAY['فعاليات','برامج','أخبار','مواعيد'], 1),
  ((SELECT id FROM public.support_categories WHERE label='الفعاليات والبرامج'),
    'كيف يمكنني التسجيل في برنامج؟',
    'افتح صفحة البرنامج المعني واضغط على "التسجيل" ثم اتبع التعليمات. بعض البرامج تتطلب شروط مسبقة موضحة في صفحة كل برنامج.',
    ARRAY['تسجيل برنامج','اشتراك','حضور'], 2),
  ((SELECT id FROM public.support_categories WHERE label='الحوكمة والشفافية'),
    'أين يمكنني الاطلاع على اللوائح والسياسات؟',
    'جميع وثائق الحوكمة (النظام الأساسي، اللوائح، السياسات، التقارير السنوية) متاحة في صفحة "الحوكمة" للتحميل بصيغة PDF.',
    ARRAY['لوائح','سياسات','نظام أساسي','تقارير'], 1),
  ((SELECT id FROM public.support_categories WHERE label='الحوكمة والشفافية'),
    'كيف أقدّم شكوى أو ملاحظة؟',
    'يمكنك تقديم شكواك عبر نموذج التواصل في صفحة "اتصل بنا" أو عبر البريد الرسمي للجمعية، وسيتم التعامل معها بسرية تامة.',
    ARRAY['شكوى','ملاحظة','بلاغ'], 2),
  ((SELECT id FROM public.support_categories WHERE label='التواصل'),
    'كيف أتواصل مع الجمعية؟',
    'متاحة عدة قنوات: نموذج التواصل في صفحة "اتصل بنا"، البريد الإلكتروني الرسمي، أرقام الهاتف، وحسابات التواصل الاجتماعي. كل التفاصيل في صفحة التواصل.',
    ARRAY['تواصل','اتصال','هاتف','بريد'], 1),
  ((SELECT id FROM public.support_categories WHERE label='التواصل'),
    'ما هي ساعات العمل الرسمية؟',
    'ساعات العمل الرسمية من الأحد إلى الخميس من 8 صباحاً حتى 4 مساءً، باستثناء الإجازات الرسمية.',
    ARRAY['ساعات عمل','دوام','مواعيد'], 2),
  ((SELECT id FROM public.support_categories WHERE label='التواصل'),
    'هل تردون على الرسائل في عطلة نهاية الأسبوع؟',
    'نحاول الرد على الرسائل العاجلة، أما الرسائل العادية فيتم الرد عليها في أول يوم عمل.',
    ARRAY['عطلة','نهاية الأسبوع','جمعة'], 3);

-- Seed quick links
INSERT INTO public.support_quick_links (label, description, url, icon, link_type, sort_order) VALUES
  ('دليل المستفيد PDF', 'الدليل الكامل لخدمات الجمعية', '#', 'FileText', 'pdf', 1),
  ('قناة اليوتيوب', 'فيديوهات تعريفية وفعاليات', 'https://youtube.com', 'Youtube', 'video', 2),
  ('النظام الأساسي', 'وثيقة النظام الأساسي للجمعية', '/governance', 'ScrollText', 'pdf', 3),
  ('اتصل بنا', 'كل قنوات التواصل', '/contact', 'Phone', 'link', 4),
  ('الأخبار والإعلانات', 'آخر مستجدات الجمعية', '/news', 'Newspaper', 'link', 5);
