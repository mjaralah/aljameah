ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS header_brand_name_en text,
  ADD COLUMN IF NOT EXISTS header_tagline_ar text,
  ADD COLUMN IF NOT EXISTS header_tagline_en text;