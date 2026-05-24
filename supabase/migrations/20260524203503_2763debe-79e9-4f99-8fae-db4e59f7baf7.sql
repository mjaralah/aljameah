CREATE TABLE IF NOT EXISTS public.public_content_versions (
  id boolean PRIMARY KEY DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT public_content_versions_single_row CHECK (id = true)
);

ALTER TABLE public.public_content_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads public content version" ON public.public_content_versions;
CREATE POLICY "Public reads public content version"
ON public.public_content_versions
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.public_content_versions (id, updated_at)
VALUES (true, now())
ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at;

CREATE OR REPLACE FUNCTION public.bump_public_content_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.public_content_versions (id, updated_at)
  VALUES (true, now())
  ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_public_content_version() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bump_public_content_version() FROM anon;
REVOKE ALL ON FUNCTION public.bump_public_content_version() FROM authenticated;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'hero_slides',
    'news',
    'programs',
    'partners',
    'board_members',
    'board_settings',
    'governance_documents',
    'governance_categories',
    'site_settings',
    'about_content',
    'surveys',
    'survey_questions',
    'page_content',
    'legal_pages',
    'custom_pages',
    'custom_forms'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_bump_public_content_version ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_bump_public_content_version AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.bump_public_content_version()',
      t
    );
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'public_content_versions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_content_versions;
  END IF;
END $$;