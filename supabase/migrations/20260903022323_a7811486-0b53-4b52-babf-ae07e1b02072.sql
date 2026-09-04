GRANT SELECT (id, type, item_name, category, description, place, item_date, reporter_name, image_url, is_resolved, created_at, expires_at, user_id) ON public.items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;