REVOKE SELECT ON public.items FROM anon;

DROP POLICY IF EXISTS "Anyone can view item details" ON public.items;

CREATE POLICY "Signed in users can view items"
ON public.items
FOR SELECT
TO authenticated
USING (true);