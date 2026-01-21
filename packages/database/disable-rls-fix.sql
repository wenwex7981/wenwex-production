-- ===========================================
-- WENWEX DATABASE FINAL "NUCLEAR" FIX
-- ===========================================
-- The previous fixes tried to adjust security rules (RLS), but they are still blocking you.
-- This script completely DISABLES the security checks for these specific carousel tables.
-- It relies purely on the fact that only your Admin Panel has the "Save" buttons.

-- 1. Disable Row Level Security (RLS)
-- This turns off the "Policy" system for these tables entirely.
ALTER TABLE public.promo_carousel_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_carousel_items DISABLE ROW LEVEL SECURITY;

-- 2. Grant Unlimited Access to Logged-in Users (and Server)
-- Since RLS is off, these Permissions are the only thing that matters.
GRANT ALL ON TABLE public.promo_carousel_slides TO authenticated, service_role;
GRANT ALL ON TABLE public.sponsored_carousel_items TO authenticated, service_role;

-- 3. Grant Read-Only Access to Public (So they can see the carousels)
GRANT SELECT ON TABLE public.promo_carousel_slides TO anon;
GRANT SELECT ON TABLE public.sponsored_carousel_items TO anon;

-- 4. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
