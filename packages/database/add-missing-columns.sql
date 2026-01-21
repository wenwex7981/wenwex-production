-- ===========================================
-- WENWEX DATABASE FINAL FIX: Add Missing 'type' Column
-- ===========================================
-- The error "Could not find the 'type' column" means the Admin Panel code is trying to save a 'type' field.
-- We must add this column to the database to match the code's expectation.

-- 1. Add 'type' column to promo_carousel_slides
ALTER TABLE public.promo_carousel_slides 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general';

-- 2. Add 'type' column to sponsored_carousel_items (User specifically mentioned this one too)
ALTER TABLE public.sponsored_carousel_items 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'sponsored';

-- 3. Force Refresh Schema Cache (CRITICAL step)
NOTIFY pgrst, 'reload config';

-- 4. Re-grant permissions just in case
GRANT ALL ON TABLE public.promo_carousel_slides TO service_role;
GRANT ALL ON TABLE public.sponsored_carousel_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.promo_carousel_slides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sponsored_carousel_items TO authenticated;
GRANT SELECT ON TABLE public.promo_carousel_slides TO anon;
GRANT SELECT ON TABLE public.sponsored_carousel_items TO anon;
