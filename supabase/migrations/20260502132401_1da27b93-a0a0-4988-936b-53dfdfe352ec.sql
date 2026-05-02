
-- 1) about_content: key/value flexible storage for About page sections
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  data JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads about content"
  ON public.about_content FOR SELECT
  TO anon, authenticated
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff manage about content"
  ON public.about_content FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER about_content_touch
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) surveys
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  ends_at DATE,
  show_public_results BOOLEAN NOT NULL DEFAULT true,
  participants INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads surveys"
  ON public.surveys FOR SELECT
  TO anon, authenticated
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff manage surveys"
  ON public.surveys FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER surveys_touch
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) survey_questions
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB,
  scale JSONB,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads survey questions"
  ON public.survey_questions FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_questions.survey_id
        AND (s.published = true OR is_staff(auth.uid()))
    )
  );

CREATE POLICY "Staff manage survey questions"
  ON public.survey_questions FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- 4) survey_responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit survey response"
  ON public.survey_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff read survey responses"
  ON public.survey_responses FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "Staff delete survey responses"
  ON public.survey_responses FOR DELETE
  TO authenticated
  USING (is_staff(auth.uid()));

-- 5) legal_pages
CREATE TABLE public.legal_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads legal pages"
  ON public.legal_pages FOR SELECT
  TO anon, authenticated
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff manage legal pages"
  ON public.legal_pages FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER legal_pages_touch
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial about_content sections so admin can edit immediately
INSERT INTO public.about_content (section_key, title, content, data, sort_order) VALUES
  ('founding', 'النشأة والتأسيس',
   'تأسست جمعية العطاء الخيرية عام 2020م بقرار من المركز الوطني لتنمية القطاع الغير ربحي، تحت السجل رقم 1234/2020، استجابةً لحاجة مجتمعية متنامية إلى عملٍ خيري مؤسسي يُوازن بين الإغاثة العاجلة والتنمية المستدامة.

بدأت رحلتنا بفريقٍ صغير من المؤمنين بقيمة العطاء، ونمت لتصبح اليوم منصةً وطنيةً تخدم آلاف الأسر سنوياً عبر شبكةٍ من المتطوعين والشركاء، مستلهمةً مسارها من رؤية المملكة 2030 في تمكين القطاع غير الربحي.',
   '{"stats":[{"value":"2020","label":"سنة التأسيس"},{"value":"+5","label":"سنوات من العطاء"},{"value":"+50K","label":"مستفيد ومستفيدة"}]}'::jsonb,
   1),
  ('vision', 'الرؤية',
   'أن نكون جمعيةً رائدةً في العمل الخيري المؤسسي، نُلهم العطاء ونصنع أثراً مستداماً في حياة الإنسان والمجتمع.',
   NULL, 2),
  ('mission', 'الرسالة',
   'تقديم برامج وخدمات نوعية للفئات المحتاجة في مجالات التعليم والصحة والإغاثة والتنمية، عبر فريقٍ مؤهَّل وشراكاتٍ فاعلة، وبأعلى معايير الجودة والحوكمة.',
   '{"values":[{"icon":"Heart","title":"الإحسان","desc":"نعمل بإخلاص لخدمة الإنسان."},{"icon":"ShieldCheck","title":"الأمانة","desc":"نحفظ ما يُؤتمن إلينا بمسؤولية."},{"icon":"Handshake","title":"التعاون","desc":"نُؤمن بأن الأثر الكبير ثمرة عمل جماعي."},{"icon":"Lightbulb","title":"الإبداع","desc":"نبتكر حلولاً مستدامة لتحديات المجتمع."}]}'::jsonb,
   3),
  ('strategic', 'الأهداف الاستراتيجية', 'أهدافٌ بعيدة المدى تُشكّل بوصلة عمل الجمعية للسنوات القادمة:',
   '{"goals":[{"title":"تعزيز الأثر المجتمعي","desc":"توسيع نطاق برامجنا لتصل إلى شرائح أوسع من المستفيدين بجودة عالية."},{"title":"الاستدامة المالية","desc":"تنويع مصادر الدخل وبناء أوقاف تضمن استمرارية العطاء."},{"title":"التحوّل الرقمي","desc":"رقمنة الخدمات والإجراءات لتعزيز الكفاءة والشفافية."},{"title":"تمكين الكوادر البشرية","desc":"تطوير قدرات الموظفين والمتطوعين عبر برامج تدريب نوعية."},{"title":"الشراكات الاستراتيجية","desc":"بناء تحالفات مع القطاعين الحكومي والخاص لمضاعفة الأثر."},{"title":"الحوكمة","desc":"تطبيق أعلى معايير الحوكمة وفق رؤية المملكة 2030."}]}'::jsonb,
   4),
  ('operational', 'الأهداف التشغيلية', 'مؤشرات أداء سنوية قابلة للقياس، نَعمل عليها بشكلٍ مباشر:',
   '{"items":["خدمة 50,000 مستفيد سنوياً عبر برامج الجمعية المختلفة","إطلاق 6 برامج تنموية نوعية خلال العام","تدريب 500 متطوع على معايير العمل الخيري المؤسسي","نشر التقارير المالية والتشغيلية ربع سنوياً","تحقيق رضا المستفيدين بنسبة لا تقل عن 90%","أتمتة 80% من الإجراءات الإدارية والمالية"]}'::jsonb,
   5),
  ('ceo', 'المدير التنفيذي', 'يقود المدير التنفيذي العمل اليومي للجمعية وفق توجيهات مجلس الإدارة، ويُشرف على تنفيذ الخطط الاستراتيجية والتشغيلية، ويُمثّل الجمعية في الشراكات والمحافل الوطنية. يحمل خبرةً تتجاوز 15 عاماً في إدارة المنظمات غير الربحية وتطوير البرامج التنموية.',
   '{"name":"أ. فيصل عبدالعزيز","title":"المدير التنفيذي","photo_url":null}'::jsonb,
   6),
  ('assembly', 'الجمعية العمومية', 'الجمعية العمومية هي السلطة العليا في الجمعية، وتتألف من جميع الأعضاء المؤسسين والعاملين الذين أوفوا بالتزاماتهم وفق النظام الأساسي.',
   '{"cards":[{"title":"الاختصاصات","body":"إقرار الخطط والسياسات، اعتماد التقارير المالية والإدارية، انتخاب مجلس الإدارة."},{"title":"الاجتماعات","body":"اجتماع عادي سنوي، واجتماعات غير عادية عند الحاجة وفق نظام الجمعيات."},{"title":"الأعضاء","body":"عضويةٌ مفتوحة وفق الشروط النظامية، مع حقوق متساوية في التصويت."}]}'::jsonb,
   7);

-- Seed legal pages placeholders
INSERT INTO public.legal_pages (slug, title, content) VALUES
  ('privacy-policy', 'سياسة الخصوصية', 'يرجى تعديل هذا المحتوى من لوحة التحكم.'),
  ('terms-of-use', 'شروط الاستخدام', 'يرجى تعديل هذا المحتوى من لوحة التحكم.'),
  ('cookie-policy', 'سياسة ملفات الارتباط', 'يرجى تعديل هذا المحتوى من لوحة التحكم.'),
  ('accessibility-statement', 'بيان إمكانية الوصول', 'يرجى تعديل هذا المحتوى من لوحة التحكم.');
