CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, item_id)
);

GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT ALL ON public.user_reports TO service_role;

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can file their own reports"
ON public.user_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id AND auth.uid() <> reported_user_id);

CREATE POLICY "Users can see reports they filed"
ON public.user_reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id);

CREATE TABLE public.user_bans (
  user_id uuid PRIMARY KEY,
  banned_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_bans TO authenticated;
GRANT ALL ON public.user_bans TO service_role;

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed in users can view bans"
ON public.user_bans FOR SELECT TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans b
    WHERE b.user_id = _user_id AND b.banned_until > now()
  )
$$;

CREATE OR REPLACE FUNCTION public.apply_ban_after_reports()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count integer;
BEGIN
  SELECT count(DISTINCT reporter_id) INTO report_count
  FROM public.user_reports
  WHERE reported_user_id = NEW.reported_user_id;

  IF report_count >= 5 THEN
    INSERT INTO public.user_bans (user_id, banned_until)
    VALUES (NEW.reported_user_id, now() + interval '1 month')
    ON CONFLICT (user_id) DO UPDATE
      SET banned_until = GREATEST(public.user_bans.banned_until, now() + interval '1 month');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER apply_ban_after_reports
AFTER INSERT ON public.user_reports
FOR EACH ROW EXECUTE FUNCTION public.apply_ban_after_reports();

DROP POLICY IF EXISTS "Signed in users can post items" ON public.items;
CREATE POLICY "Signed in users can post items"
ON public.items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));