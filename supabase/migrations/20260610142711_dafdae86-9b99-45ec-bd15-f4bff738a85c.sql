-- 1) Grant public read on the sanitized about_content_public view
GRANT SELECT ON public.about_content_public TO anon, authenticated;

-- 2) Lock down SECURITY DEFINER trigger/admin functions from public execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_public_content_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.list_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

-- 3) Tighten survey_responses INSERT: only allow submitting to a published, active survey
DROP POLICY IF EXISTS "Anyone can submit survey response" ON public.survey_responses;
CREATE POLICY "Anyone can submit survey response"
ON public.survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = survey_responses.survey_id
      AND s.published = true
      AND (s.status IS NULL OR s.status <> 'archived')
      AND (s.ends_at IS NULL OR s.ends_at >= CURRENT_DATE)
  )
);

-- 4) Allow staff to update survey responses (completes policy set)
CREATE POLICY "Staff update survey responses"
ON public.survey_responses
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));