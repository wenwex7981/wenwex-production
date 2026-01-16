-- ===========================================
-- WENVEX VENDOR PORTFOLIO TABLE
-- ===========================================
-- Run this in Supabase SQL Editor to create/fix the vendor_portfolio table

-- Create vendor_portfolio table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendor_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'IMAGE',
    url TEXT,
    thumbnail_url TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key if vendors table exists
-- ALTER TABLE vendor_portfolio ADD CONSTRAINT fk_portfolio_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_vendor ON vendor_portfolio(vendor_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON vendor_portfolio("order");

-- Enable RLS
ALTER TABLE vendor_portfolio ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Allow public read portfolio" ON vendor_portfolio;
CREATE POLICY "Allow public read portfolio" ON vendor_portfolio
    FOR SELECT USING (true);

-- Allow authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated full access portfolio" ON vendor_portfolio;
CREATE POLICY "Allow authenticated full access portfolio" ON vendor_portfolio
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON vendor_portfolio TO anon;
GRANT ALL ON vendor_portfolio TO authenticated;

-- Success message
SELECT 'Vendor Portfolio table created/fixed! Portfolio loading should work now.' as status;
