DROP VIEW IF EXISTS public.items_public;

-- Column-level grants: everything except contact_email / contact_whatsapp
GRANT SELECT (id, type, item_name, category, description, place, item_date,
              reporter_name, image_url, is_resolved, created_at)
  ON public.items TO anon, authenticated;

CREATE POLICY "Anyone can view item details" ON public.items FOR SELECT USING (true);