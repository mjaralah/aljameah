
-- 1) Sanitized public view: strips email/phone from assembly members
-- whose contact_public flag is not true. Other sections are unchanged.
CREATE OR REPLACE VIEW public.about_content_public
WITH (security_invoker = off) AS
SELECT
  id,
  section_key,
  title,
  content,
  sort_order,
  published,
  created_at,
  updated_at,
  CASE
    WHEN section_key = 'assembly'
         AND data IS NOT NULL
         AND data #> '{assembly,members}' IS NOT NULL
      THEN jsonb_set(
        data,
        '{assembly,members}',
        COALESCE((
          SELECT jsonb_agg(
            CASE
              WHEN COALESCE((m->>'contact_public')::boolean, false) = true
                THEN m
              ELSE (m - 'email' - 'phone')
            END
          )
          FROM jsonb_array_elements(data #> '{assembly,members}') AS m
        ), '[]'::jsonb),
        false
      )
    ELSE data
  END AS data
FROM public.about_content
WHERE published = true;

GRANT SELECT ON public.about_content_public TO anon, authenticated;

-- 2) Restrict raw table SELECT to staff only (was public for published rows).
DROP POLICY IF EXISTS "Public reads about content" ON public.about_content;

CREATE POLICY "Staff reads about content"
  ON public.about_content
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));
