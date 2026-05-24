
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS donate_button_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS donate_button_label_ar text,
  ADD COLUMN IF NOT EXISTS donate_button_label_en text,
  ADD COLUMN IF NOT EXISTS donate_button_url text NOT NULL DEFAULT '/donate',
  ADD COLUMN IF NOT EXISTS donate_button_bg_color text,
  ADD COLUMN IF NOT EXISTS donate_button_text_color text,
  ADD COLUMN IF NOT EXISTS donate_button_icon text NOT NULL DEFAULT 'heart';
