REVOKE ALL ON FUNCTION public.get_item_contact(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_item_contact(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_item_contact(_item_id uuid)
 RETURNS TABLE(contact_email text, contact_whatsapp text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT i.contact_email, i.contact_whatsapp
  FROM public.items i
  WHERE i.id = _item_id
    AND auth.uid() IS NOT NULL
$function$;

REVOKE ALL ON FUNCTION public.get_item_contact(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_item_contact(uuid) TO authenticated, service_role;