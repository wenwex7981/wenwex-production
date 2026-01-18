-- =====================================================
-- REAL FOLLOWERS SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create vendor_followers table to track real followers
CREATE TABLE IF NOT EXISTS vendor_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, user_id)
);

-- Enable RLS
ALTER TABLE vendor_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "vendor_followers_public_read" ON vendor_followers 
    FOR SELECT USING (true);

CREATE POLICY "vendor_followers_auth_insert" ON vendor_followers 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vendor_followers_auth_delete" ON vendor_followers 
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vendor_followers_vendor ON vendor_followers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_followers_user ON vendor_followers(user_id);

-- Function to update follower count on vendors table
CREATE OR REPLACE FUNCTION update_vendor_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vendors 
        SET followers_count = COALESCE(followers_count, 0) + 1 
        WHERE id = NEW.vendor_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vendors 
        SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
        WHERE id = OLD.vendor_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update follower count
DROP TRIGGER IF EXISTS trigger_update_follower_count ON vendor_followers;
CREATE TRIGGER trigger_update_follower_count
AFTER INSERT OR DELETE ON vendor_followers
FOR EACH ROW EXECUTE FUNCTION update_vendor_follower_count();

-- Ensure followers_count column exists on vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Grant permissions
GRANT SELECT ON vendor_followers TO anon, authenticated;
GRANT INSERT, DELETE ON vendor_followers TO authenticated;
