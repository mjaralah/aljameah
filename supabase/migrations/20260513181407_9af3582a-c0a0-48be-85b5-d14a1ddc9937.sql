-- Add term_duration to board members
ALTER TABLE public.board_members ADD COLUMN IF NOT EXISTS term_duration text;

-- Create board_settings table (single row)
CREATE TABLE IF NOT EXISTS public.board_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_text text,
  term_duration_label text,
  term_end_hijri text,
  term_end_gregorian date,
  show_hijri boolean NOT NULL DEFAULT true,
  show_gregorian boolean NOT NULL DEFAULT true,
  formation_decree_url text,
  formation_decree_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads board settings"
  ON public.board_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Staff manage board settings"
  ON public.board_settings FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER trg_board_settings_updated_at
  BEFORE UPDATE ON public.board_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default row
INSERT INTO public.board_settings (intro_text, term_duration_label, show_hijri, show_gregorian)
SELECT 'نخبةٌ من الكفاءات المتطوّعة لخدمة رسالة الجمعية، يُمثّلون تنوعاً في الخبرات والتخصصات.', '4 سنوات', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.board_settings);