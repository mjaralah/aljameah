ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS sponsor_button_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sponsor_button_label text,
  ADD COLUMN IF NOT EXISTS sponsor_button_label_en text,
  ADD COLUMN IF NOT EXISTS sponsor_button_url text,
  ADD COLUMN IF NOT EXISTS sponsor_button_icon text DEFAULT 'Heart';