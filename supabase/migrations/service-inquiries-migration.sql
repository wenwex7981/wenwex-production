-- Service Inquiries Migration
-- This table stores quote requests and demo booking requests from users
-- Note: services.id and vendors.id are TEXT type in this database

CREATE TABLE IF NOT EXISTS service_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys - using TEXT to match existing table schemas
    service_id TEXT,  -- References services(id) which is TEXT
    vendor_id TEXT,   -- References vendors(id) which is TEXT
    user_id TEXT,     -- User ID from auth
    
    -- Inquiry type: 'quote' or 'demo'
    inquiry_type VARCHAR(20) NOT NULL DEFAULT 'quote',
    
    -- Contact information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Request details
    service_title VARCHAR(500),
    budget VARCHAR(100),
    message TEXT,
    preferred_date DATE,
    preferred_time VARCHAR(10),
    
    -- Vendor response
    vendor_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_service_inquiries_vendor ON service_inquiries(vendor_id);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_service ON service_inquiries(service_id);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_user ON service_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_type ON service_inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_created ON service_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Vendors can view their inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Vendors can update inquiry status" ON service_inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Anyone can view inquiries" ON service_inquiries;

-- RLS Policies
-- Anyone can create inquiries (for contact forms)
CREATE POLICY "Anyone can create inquiries" ON service_inquiries
    FOR INSERT WITH CHECK (true);

-- Anyone can view inquiries (vendors check done at app level)
CREATE POLICY "Anyone can view inquiries" ON service_inquiries
    FOR SELECT USING (true);

-- Allow updates
CREATE POLICY "Allow updates" ON service_inquiries
    FOR UPDATE USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_service_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_inquiries_updated_at_trigger ON service_inquiries;
CREATE TRIGGER service_inquiries_updated_at_trigger
    BEFORE UPDATE ON service_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_service_inquiries_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON service_inquiries TO authenticated;
GRANT SELECT, INSERT ON service_inquiries TO anon;

SELECT 'Service inquiries table created successfully!' AS result;
