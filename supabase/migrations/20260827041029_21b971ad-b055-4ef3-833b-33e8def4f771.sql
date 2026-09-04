REVOKE EXECUTE ON FUNCTION public.apply_ban_after_reports() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_banned(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;