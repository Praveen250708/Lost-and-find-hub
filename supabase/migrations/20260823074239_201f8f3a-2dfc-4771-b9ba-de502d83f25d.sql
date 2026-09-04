-- Remove blanket public read of the items table (contains contact details)
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
REVOKE SELECT ON public.items FROM anon, authenticated;

-- Public-safe view without contact columns
CREATE OR REPLACE VIEW public.items_public
WITH (security_invoker = off) AS
SELECT id, type, item_name, category, description, place, item_date,
       reporter_name, image_url, is_resolved, created_at
FROM public.items;

GRANT SELECT ON public.items_public TO anon, authenticated;

-- Single-item contact lookup (no bulk harvesting)
CREATE OR REPLACE FUNCTION public.get_item_contact(_item_id uuid)
RETURNS TABLE (contact_email text, contact_whatsapp text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.contact_email, i.contact_whatsapp
  FROM public.items i
  WHERE i.id = _item_id
$$;

REVOKE ALL ON FUNCTION public.get_item_contact(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_item_contact(uuid) TO anon, authenticated;