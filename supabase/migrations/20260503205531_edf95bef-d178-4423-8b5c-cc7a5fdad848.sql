
DROP POLICY IF EXISTS "Public reads page content" ON public.page_content;
CREATE POLICY "Public reads page content"
ON public.page_content
FOR SELECT
TO anon, authenticated
USING (true);
