
-- 1) Trigger so every new auth.users row creates a profiles row
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill missing profiles for existing users
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3) Aggregated, admin-only listing RPC
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  roles text[],
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_disabled boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    COALESCE(p.email, u.email) AS email,
    p.full_name,
    COALESCE(
      (SELECT array_agg(r.role::text ORDER BY r.role)
       FROM public.user_roles r WHERE r.user_id = u.id),
      ARRAY[]::text[]
    ) AS roles,
    u.created_at,
    u.last_sign_in_at,
    (u.banned_until IS NOT NULL AND u.banned_until > now()) AS is_disabled
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;
