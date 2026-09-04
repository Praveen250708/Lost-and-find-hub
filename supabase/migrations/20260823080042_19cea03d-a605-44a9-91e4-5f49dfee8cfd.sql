ALTER TABLE public.items ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS items_user_id_idx ON public.items(user_id);

GRANT SELECT (user_id) ON public.items TO anon, authenticated;
GRANT UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

DROP POLICY IF EXISTS "Anyone can post items" ON public.items;

CREATE POLICY "Signed in users can post items"
ON public.items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their items"
ON public.items FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their items"
ON public.items FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS phone_otps_phone_idx ON public.phone_otps(phone, created_at DESC);

GRANT ALL ON public.phone_otps TO service_role;

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
