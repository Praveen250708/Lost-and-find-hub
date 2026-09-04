-- Profiles: campus details
ALTER TABLE public.profiles
  ALTER COLUMN city DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS college text NOT NULL DEFAULT 'Sri Manakula Vinayagar Engineering College',
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS whatsapp text;

CREATE INDEX IF NOT EXISTS profiles_whatsapp_idx ON public.profiles (whatsapp);

-- Items: per-report expiry, 2 months after posting
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 months');

UPDATE public.items SET expires_at = created_at + interval '2 months';

CREATE OR REPLACE FUNCTION public.delete_expired_items()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.items WHERE expires_at <= now();
$$;

REVOKE ALL ON FUNCTION public.delete_expired_items() FROM public, anon, authenticated;

-- Search a user by WhatsApp number (no email exposed)
CREATE OR REPLACE FUNCTION public.find_users_by_phone(_phone text)
RETURNS TABLE(name text, college text, department text, year text, section text, whatsapp text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.college, p.department, p.year, p.section, p.whatsapp
  FROM public.profiles p
  WHERE length(regexp_replace(coalesce(_phone, ''), '\D', '', 'g')) >= 6
    AND regexp_replace(coalesce(p.whatsapp, ''), '\D', '', 'g')
        LIKE '%' || regexp_replace(_phone, '\D', '', 'g') || '%'
  LIMIT 20
$$;

GRANT EXECUTE ON FUNCTION public.find_users_by_phone(text) TO authenticated;

-- Daily clean-up of expired reports
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.schedule(
  'delete-expired-items-daily',
  '30 1 * * *',
  $$SELECT public.delete_expired_items();$$
);