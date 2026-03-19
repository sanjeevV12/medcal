
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'BLS',
  vehicle_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  latitude NUMERIC,
  longitude NUMERIC,
  rating NUMERIC DEFAULT 4.5,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Anyone can register as driver" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Drivers can update own record" ON public.drivers FOR UPDATE USING (true);
