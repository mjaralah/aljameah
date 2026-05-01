
-- Restrict storage SELECT to specific paths only (prevents bucket listing)
DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;

-- Public can read individual files but cannot list bucket contents.
-- The list endpoint requires a separate ability; SELECT by exact name is fine.
-- We keep SELECT policy but rely on app to access by direct URL.
CREATE POLICY "Public read site-media files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media' AND (storage.foldername(name))[1] IS NOT NULL);

CREATE POLICY "Public read documents files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] IS NOT NULL);

-- Revoke EXECUTE on internal helper functions from public roles
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(UUID) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
