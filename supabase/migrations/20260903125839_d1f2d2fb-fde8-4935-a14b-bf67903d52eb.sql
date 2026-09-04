DROP FUNCTION IF EXISTS public.find_users_by_phone(text);

REVOKE ALL ON FUNCTION public.delete_expired_items() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_items() TO service_role;

REVOKE ALL ON FUNCTION public.get_item_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_item_contact(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_banned(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO authenticated, service_role;