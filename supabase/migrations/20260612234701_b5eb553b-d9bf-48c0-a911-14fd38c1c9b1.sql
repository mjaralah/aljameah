CREATE POLICY "Anyone can read published help articles" ON public.help_articles FOR SELECT TO anon USING (is_published = true);
GRANT SELECT ON public.help_articles TO anon;