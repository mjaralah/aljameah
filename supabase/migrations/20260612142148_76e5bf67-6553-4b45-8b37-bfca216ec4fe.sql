
CREATE TABLE public.help_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,
  media_url TEXT,
  action_label TEXT,
  action_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_articles TO authenticated;
GRANT ALL ON public.help_articles TO service_role;

ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read published help articles"
ON public.help_articles FOR SELECT
TO authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage help articles"
ON public.help_articles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER help_articles_touch
BEFORE UPDATE ON public.help_articles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX help_articles_category_idx ON public.help_articles(category, sort_order);
