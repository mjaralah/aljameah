ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS whatsapp_tooltip text,
  ADD COLUMN IF NOT EXISTS whatsapp_show_tooltip boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_position text NOT NULL DEFAULT 'left';