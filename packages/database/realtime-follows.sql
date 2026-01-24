-- Enable Realtime for Follows and Fix RLS
-- Run this in Supabase SQL Editor

-- 1. Ensure follows table exists (DB should have it from Prisma, but good to be safe)
CREATE TABLE IF NOT EXISTS public.follows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vendor_id text NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, vendor_id)
);

-- 2. Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Everyone can view follows (to see counts)
CREATE POLICY "Everyone can view follows" ON public.follows FOR SELECT USING (true);

-- Authenticated users can follow
CREATE POLICY "Authenticated users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid()::text = user_id);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;

-- 5. Grant Permissions
GRANT ALL ON public.follows TO postgres;
GRANT ALL ON public.follows TO service_role;
GRANT ALL ON public.follows TO authenticated;
GRANT ALL ON public.follows TO anon;

SELECT 'Realtime enabled for follows table' as status;
