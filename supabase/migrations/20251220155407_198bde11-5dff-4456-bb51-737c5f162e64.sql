-- Create hospitals table for partner hospitals directory
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specializations TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  image_url TEXT,
  is_partner BOOLEAN DEFAULT true,
  emergency_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Allow public read access (hospitals are public info)
CREATE POLICY "Anyone can view hospitals"
ON public.hospitals
FOR SELECT
USING (true);

-- Insert sample Bhopal hospitals
INSERT INTO public.hospitals (name, address, phone, specializations, rating, total_reviews, latitude, longitude, emergency_available) VALUES
('AIIMS Bhopal', 'Saket Nagar, Bhopal, MP 462020', '+91-755-2672355', ARRAY['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Medicine'], 4.5, 2847, 23.2123, 77.4367, true),
('Hamidia Hospital', 'Royal Market, Bhopal, MP 462001', '+91-755-2540222', ARRAY['Emergency Care', 'General Surgery', 'Pediatrics', 'Gynecology'], 4.0, 1523, 23.2599, 77.4126, true),
('Bansal Hospital', 'C-Sector, Shahpura, Bhopal, MP 462016', '+91-755-4271777', ARRAY['Cardiology', 'Orthopedics', 'Neurosurgery', 'Gastroenterology'], 4.3, 1892, 23.1939, 77.4422, true),
('Chirayu Medical College', 'Bhainsakhedi, Bhopal-Indore Highway, MP 462030', '+91-755-6679100', ARRAY['Multi-Specialty', 'Trauma Care', 'Cardiac Surgery', 'Nephrology'], 4.2, 1245, 23.1756, 77.3489, true),
('People''s Hospital', '462037, Karond Bypass Rd, Bhopal, MP', '+91-755-4005000', ARRAY['Cardiology', 'Cancer Care', 'IVF', 'Joint Replacement'], 4.4, 2156, 23.2891, 77.4234, true),
('Noble Multispecialty Hospital', 'Opp. Misrod Police Station, Bhopal, MP 462026', '+91-755-2894100', ARRAY['Cardiology', 'Orthopedics', 'Urology', 'Critical Care'], 4.1, 987, 23.2234, 77.4856, true),
('L.N. Medical College & Hospital', 'J.K. Road, Kolar, Bhopal, MP 462042', '+91-755-2895000', ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Dermatology'], 4.0, 1134, 23.1678, 77.4123, true),
('Jawaharlal Nehru Cancer Hospital', 'Idgah Hills, Bhopal, MP 462001', '+91-755-2761211', ARRAY['Oncology', 'Radiation Therapy', 'Chemotherapy', 'Palliative Care'], 4.3, 876, 23.2654, 77.4089, true);