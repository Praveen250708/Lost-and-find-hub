CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('lost','found')),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Electronics','Documents','Keys','Clothing','Other')),
  description TEXT,
  place TEXT NOT NULL,
  item_date DATE NOT NULL,
  reporter_name TEXT NOT NULL,
  contact_email TEXT,
  contact_whatsapp TEXT,
  image_url TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.items TO anon;
GRANT SELECT, INSERT ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Anyone can post items" ON public.items FOR INSERT WITH CHECK (true);

INSERT INTO public.items (type, item_name, category, description, place, item_date, reporter_name, contact_email, contact_whatsapp) VALUES
('lost','Blue Student ID Card','Documents','ID card of 2nd year CSE student, name printed on front.','Near Library entrance','2026-08-11','Ananya R','ananya@campus.edu','919876543210'),
('found','Black Casio Watch','Other','Found on a bench, digital display, slightly scratched strap.','Basketball Court','2026-08-12','Rahul K',NULL,'919812345678'),
('found','Bunch of Keys with Red Tag','Keys','Three keys on a ring with a red plastic tag.','Block C corridor','2026-08-13','Security Desk','security@campus.edu',NULL),
('lost','White Lab Coat','Clothing','Size M, name written inside collar.','Chemistry Lab 2','2026-08-10','Meera S','meera@campus.edu','919900112233'),
('lost','Boat Airdopes Case','Electronics','Black earbuds case, no earbuds inside.','Bus Stop Gate 2','2026-08-13','Vikram P',NULL,'919845001122'),
('found','Spiral Notebook - Maths','Documents','Full of unit 3 notes, no name.','Room 204','2026-08-09','Divya N','divya@campus.edu',NULL);