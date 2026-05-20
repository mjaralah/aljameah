ALTER TABLE public.custom_pages
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'blank',
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text,
  ADD COLUMN IF NOT EXISTS hero_cta_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_url text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS content_en text;

CREATE INDEX IF NOT EXISTS idx_page_content_page_key_sort ON public.page_content(page_key, sort_order);