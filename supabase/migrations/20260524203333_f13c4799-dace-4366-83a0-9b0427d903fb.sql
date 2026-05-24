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
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;