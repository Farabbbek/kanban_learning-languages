-- Run this SQL in your Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/qefrnqglircawtefeepm/sql/new

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (subscribe)
CREATE POLICY "Allow anonymous insert" ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view subscribers (optional, for admin)
CREATE POLICY "Allow authenticated select" ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant access to anon role for INSERT
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT USAGE ON SEQUENCE newsletter_subscribers_id_seq TO anon;

-- Grant access to authenticated role for SELECT
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
