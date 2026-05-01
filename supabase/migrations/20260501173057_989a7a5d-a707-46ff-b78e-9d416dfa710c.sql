
-- Grant table privileges to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT SELECT ON public.news TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT SELECT ON public.programs TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_members TO authenticated;
GRANT SELECT ON public.board_members TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT SELECT ON public.partners TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT SELECT ON public.hero_slides TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, anon;
