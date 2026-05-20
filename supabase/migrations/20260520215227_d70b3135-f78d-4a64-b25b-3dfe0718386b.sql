CREATE TABLE public.governance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads gov categories"
  ON public.governance_categories FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));

CREATE POLICY "Staff manage gov categories"
  ON public.governance_categories FOR ALL
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER governance_categories_touch_updated_at
  BEFORE UPDATE ON public.governance_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.governance_categories (slug, label_ar, label_en, icon, sort_order) VALUES
  ('policies', 'السياسات', 'Policies', 'ShieldCheck', 10),
  ('regulations', 'اللوائح', 'Regulations', 'ScrollText', 20),
  ('plans', 'الخطط', 'Plans', 'Target', 30),
  ('investments', 'قرارات الاستثمار', 'Investment Decisions', 'TrendingUp', 40),
  ('aid', 'المساعدات العينية والنقدية', 'Aid Reports', 'HandCoins', 50),
  ('financialReports', 'التقارير المالية', 'Financial Reports', 'Wallet', 60),
  ('annualReport', 'التقرير السنوي', 'Annual Report', 'FileBarChart', 70),
  ('events', 'تقرير الفعاليات', 'Events Report', 'CalendarDays', 80);