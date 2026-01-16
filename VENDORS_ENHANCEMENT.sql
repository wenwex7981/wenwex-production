-- ===========================================
-- WENVEX VENDORS/AGENCIES ENHANCEMENT
-- ===========================================
-- Run this in Supabase SQL Editor to add new columns for agency management
-- This enables Super Admin to fully customize agencies displayed on buyer website

-- Add new columns to vendors table (if they don't exist)
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS projects_done INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS satisfaction_rate DECIMAL(5,2) DEFAULT 0;

-- Create index for approved vendors (for faster buyer-side queries)
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(is_verified);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved vendors
DROP POLICY IF EXISTS "Allow public read approved vendors" ON vendors;
CREATE POLICY "Allow public read approved vendors" ON vendors
    FOR SELECT USING (status = 'APPROVED');

-- Allow authenticated users full access (for admin)
DROP POLICY IF EXISTS "Allow authenticated full access vendors" ON vendors;
CREATE POLICY "Allow authenticated full access vendors" ON vendors
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON vendors TO anon;
GRANT ALL ON vendors TO authenticated;

-- Update some sample data for testing
UPDATE vendors SET 
    rating = 4.8,
    total_reviews = 150,
    followers_count = 850,
    banner_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
WHERE rating IS NULL OR rating = 0;

-- Success message
SELECT 'Vendors/Agencies enhancement complete! Admin can now fully customize agency profiles.' as status;
