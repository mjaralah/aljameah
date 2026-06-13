ALTER TABLE public.board_settings ADD COLUMN IF NOT EXISTS positions jsonb NOT NULL DEFAULT '["رئيس مجلس الإدارة","نائب رئيس مجلس الإدارة","عضو مجلس الإدارة"]'::jsonb;

UPDATE public.board_members SET position = 'نائب رئيس مجلس الإدارة' WHERE position = 'نائب الرئيس';
UPDATE public.board_members SET position = 'عضو مجلس الإدارة' WHERE position = 'عضو مجلس';

-- Ensure existing settings row has positions and merge any custom (non-default) positions from members
UPDATE public.board_settings SET positions = COALESCE(positions, '[]'::jsonb) || (
  SELECT COALESCE(jsonb_agg(DISTINCT to_jsonb(p.position)), '[]'::jsonb)
  FROM public.board_members p
  WHERE p.position IS NOT NULL
    AND p.position NOT IN ('رئيس مجلس الإدارة','نائب رئيس مجلس الإدارة','عضو مجلس الإدارة')
);