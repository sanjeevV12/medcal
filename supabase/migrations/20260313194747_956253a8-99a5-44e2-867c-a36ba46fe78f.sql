
CREATE TABLE public.ambulances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  vehicle_number text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'BLS',
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  status text NOT NULL DEFAULT 'available',
  rating numeric DEFAULT 4.5,
  total_trips integer DEFAULT 0,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available ambulances"
ON public.ambulances FOR SELECT
TO public
USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;

CREATE TABLE public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ambulance_id uuid REFERENCES public.ambulances(id),
  pickup_lat numeric NOT NULL,
  pickup_lng numeric NOT NULL,
  destination_hospital_id uuid REFERENCES public.hospitals(id),
  status text NOT NULL DEFAULT 'searching',
  ride_type text NOT NULL DEFAULT 'emergency',
  fare_estimate numeric,
  final_fare numeric,
  distance_km numeric,
  payment_status text DEFAULT 'pending',
  payment_method text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rides"
ON public.ride_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rides"
ON public.ride_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rides"
ON public.ride_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
