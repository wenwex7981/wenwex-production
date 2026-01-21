-- ===========================================
-- WENWEX DATABASE PERMISSIONS FIX
-- ===========================================
-- Run this script in your Supabase SQL Editor to fix permission denied errors.

-- 1. Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant access to all tables for authenticated users (required for admin panel if using authenticated role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. SPECIFIC FIX for promo_carousel_slides and sponsored_carousel_items
-- Just to be double sure permissions are applied to these new tables
GRANT ALL ON TABLE public.promo_carousel_slides TO service_role;
GRANT ALL ON TABLE public.sponsored_carousel_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.promo_carousel_slides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sponsored_carousel_items TO authenticated;

GRANT SELECT ON TABLE public.promo_carousel_slides TO anon;
GRANT SELECT ON TABLE public.sponsored_carousel_items TO anon;

-- 4. Grant access to sequences (fixes "permission denied for sequence" errors on insert)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Helper RLS policies for Super Admin writing 
-- If you rely on RLS (Row Level Security), 'GRANT' is not enough, you need a POLICY.
-- Verify that a policy exists allowing INSERT/UPDATE for your role.

CREATE POLICY "Super Admin can insert promo slides" 
ON public.promo_carousel_slides 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);

CREATE POLICY "Super Admin can update promo slides" 
ON public.promo_carousel_slides 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);

CREATE POLICY "Super Admin can delete promo slides" 
ON public.promo_carousel_slides 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);

-- Repeat for sponsored items
CREATE POLICY "Super Admin can insert sponsored items" 
ON public.sponsored_carousel_items 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);

CREATE POLICY "Super Admin can update sponsored items" 
ON public.sponsored_carousel_items 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);

CREATE POLICY "Super Admin can delete sponsored items" 
ON public.sponsored_carousel_items 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' = 'super_admin' OR auth.jwt() ->> 'role' = 'SUPER_ADMIN')
);
