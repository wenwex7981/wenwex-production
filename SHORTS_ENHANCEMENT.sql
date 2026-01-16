-- ===========================================
-- WENVEX SHORTS ENHANCEMENT
-- ===========================================
-- Run this in Supabase SQL Editor to add new columns for shorts management
-- This enables Super Admin to fully manage shorts displayed on buyer website

-- Add is_approved column if it doesn't exist
ALTER TABLE shorts 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add stats columns
ALTER TABLE shorts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Add other useful columns
ALTER TABLE shorts
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS vendor_id UUID,
ADD COLUMN IF NOT EXISTS service_id UUID;

-- Create index for approved shorts (for faster buyer-side queries)
CREATE INDEX IF NOT EXISTS idx_shorts_approved ON shorts(is_approved);

-- Enable RLS
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved shorts
DROP POLICY IF EXISTS "Allow public read approved shorts" ON shorts;
CREATE POLICY "Allow public read approved shorts" ON shorts
    FOR SELECT USING (is_approved = true);

-- Allow authenticated users full access (for admin)
DROP POLICY IF EXISTS "Allow authenticated full access shorts" ON shorts;
CREATE POLICY "Allow authenticated full access shorts" ON shorts
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON shorts TO anon;
GRANT ALL ON shorts TO authenticated;

-- Success message
SELECT 'Shorts enhancement complete! Admin can now fully manage shorts visibility and stats.' as status;
