
CREATE TABLE public.custom_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon text,
  audience text NOT NULL DEFAULT 'individuals',
  duration text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  success_message text,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads custom forms" ON public.custom_forms
  FOR SELECT TO anon, authenticated
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff manage custom forms" ON public.custom_forms
  FOR ALL TO authenticated
  USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER set_custom_forms_updated_at
  BEFORE UPDATE ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.custom_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit form" ON public.custom_form_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Staff read submissions" ON public.custom_form_submissions
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

CREATE POLICY "Staff update submissions" ON public.custom_form_submissions
  FOR UPDATE TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff delete submissions" ON public.custom_form_submissions
  FOR DELETE TO authenticated USING (is_staff(auth.uid()));

CREATE TRIGGER set_custom_form_submissions_updated_at
  BEFORE UPDATE ON public.custom_form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_custom_form_submissions_form_id ON public.custom_form_submissions(form_id);
