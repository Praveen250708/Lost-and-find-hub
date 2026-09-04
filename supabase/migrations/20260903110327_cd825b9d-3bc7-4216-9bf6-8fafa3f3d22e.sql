DROP TABLE IF EXISTS public.phone_otps;

DROP POLICY IF EXISTS "Signed in users can view bans" ON public.user_bans;
CREATE POLICY "Users can view their own ban" ON public.user_bans
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON FUNCTION public.find_users_by_phone(text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.delete_expired_items() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.apply_ban_after_reports() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.get_item_contact(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_item_contact(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.is_banned(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO authenticated;