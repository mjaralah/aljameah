DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'governance_documents_public_content_bump'
  ) THEN
    CREATE TRIGGER governance_documents_public_content_bump
    AFTER INSERT OR UPDATE OR DELETE ON public.governance_documents
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.bump_public_content_version();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'governance_categories_public_content_bump'
  ) THEN
    CREATE TRIGGER governance_categories_public_content_bump
    AFTER INSERT OR UPDATE OR DELETE ON public.governance_categories
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.bump_public_content_version();
  END IF;
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

INSERT INTO public.public_content_versions (id, updated_at)
VALUES (true, now())
ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at;