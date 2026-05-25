ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS language_toggle_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS language_toggle_label_ar text,
  ADD COLUMN IF NOT EXISTS language_toggle_label_en text,
  ADD COLUMN IF NOT EXISTS language_toggle_icon text NOT NULL DEFAULT 'languages';