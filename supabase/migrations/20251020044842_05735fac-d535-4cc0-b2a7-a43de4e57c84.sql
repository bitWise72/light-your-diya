-- Create lamps table to store all diya placements
CREATE TABLE public.lamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  coords JSONB NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 280),
  share_token TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text) from 1 for 10),
  parent_lamp_id UUID REFERENCES public.lamps(id) ON DELETE SET NULL,
  device_fingerprint TEXT NOT NULL,
  ip_address INET
);

-- Create edges table to track connections between lamps
CREATE TABLE public.edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_lamp_id UUID NOT NULL REFERENCES public.lamps(id) ON DELETE CASCADE,
  child_lamp_id UUID NOT NULL REFERENCES public.lamps(id) ON DELETE CASCADE,
  UNIQUE(parent_lamp_id, child_lamp_id)
);

-- Enable Row Level Security
ALTER TABLE public.lamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;

-- Public read access for everyone
CREATE POLICY "Anyone can view all lamps" 
ON public.lamps 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view all edges" 
ON public.edges 
FOR SELECT 
USING (true);

-- Anyone can create lamps (rate limiting handled via device fingerprint)
CREATE POLICY "Anyone can create lamps" 
ON public.lamps 
FOR INSERT 
WITH CHECK (true);

-- Edges are created automatically when lamps are created with parent_lamp_id
CREATE POLICY "Anyone can create edges" 
ON public.edges 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_lamps_coords ON public.lamps USING GIN (coords);
CREATE INDEX idx_lamps_parent ON public.lamps(parent_lamp_id);
CREATE INDEX idx_lamps_fingerprint ON public.lamps(device_fingerprint);
CREATE INDEX idx_edges_parent ON public.edges(parent_lamp_id);
CREATE INDEX idx_edges_child ON public.edges(child_lamp_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.lamps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.edges;