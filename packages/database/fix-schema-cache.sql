-- ===========================================
-- WENWEX DATABASE FIX - TYPE CACHE REFRESH & PERMISSIONS
-- ===========================================

-- 1. Reload the schema cache
NOTIFY pgrst, 'reload config';

-- 2. Explicitly Grant permissions again (ensure no race conditions)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Verify Constraints and Columns
-- Ensure 'display_order' and 'type' context columns exist or are optional if missing.
-- Note: 'promo_carousel_slides' does NOT have a 'type' column in previous scripts. 
-- If your admin panel expects 'type', we should add it OR fix the admin panel code.
-- Assuming the error meant a missing column used by the frontend:

-- OPTIONAL: Add 'type' column if your admin code heavily relies on it
-- ALTER TABLE promo_carousel_slides ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general';

-- 4. Re-apply RLS Policies
DROP POLICY IF EXISTS "Super Admin can insert promo slides" ON public.promo_carousel_slides;
DROP POLICY IF EXISTS "Super Admin can update promo slides" ON public.promo_carousel_slides;
DROP POLICY IF EXISTS "Super Admin can delete promo slides" ON public.promo_carousel_slides;

CREATE POLICY "Super Admin can insert promo slides" 
ON public.promo_carousel_slides FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' ILIKE 'super_admin')
);

CREATE POLICY "Super Admin can update promo slides" 
ON public.promo_carousel_slides FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' ILIKE 'super_admin')
);

CREATE POLICY "Super Admin can delete promo slides" 
ON public.promo_carousel_slides FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'role' ILIKE 'super_admin')
);

-- Force cache reload again
NOTIFY pgrst, 'reload config';
