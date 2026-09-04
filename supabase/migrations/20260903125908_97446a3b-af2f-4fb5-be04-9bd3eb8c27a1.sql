DROP POLICY IF EXISTS "Signed in users can post items" ON public.items;

CREATE POLICY "Signed in users can post items"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.user_bans b
    WHERE b.user_id = auth.uid() AND b.banned_until > now()
  )
);

REVOKE ALL ON FUNCTION public.is_banned(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO service_role;