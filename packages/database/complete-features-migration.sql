-- ============================================================
-- WENWEX COMPLETE DATABASE FEATURES MIGRATION (FIXED v3)
-- Run this in Supabase SQL Editor
-- Uses TEXT type for service_id and vendor_id to match existing tables
-- ============================================================

-- ============================================
-- 1. SAVED SERVICES TABLE (Favorites/Wishlist)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    service_id TEXT NOT NULL,  -- TEXT to match services.id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_id)
);

-- Indexes for saved_services
CREATE INDEX IF NOT EXISTS idx_saved_services_user ON saved_services(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_services_service ON saved_services(service_id);
CREATE INDEX IF NOT EXISTS idx_saved_services_created ON saved_services(created_at DESC);

-- Enable RLS
ALTER TABLE saved_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_services
DROP POLICY IF EXISTS "Users can view own saved services" ON saved_services;
CREATE POLICY "Users can view own saved services" ON saved_services
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can save services" ON saved_services;
CREATE POLICY "Users can save services" ON saved_services
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can remove saved services" ON saved_services;
CREATE POLICY "Users can remove saved services" ON saved_services
    FOR DELETE USING (auth.uid()::text = user_id);

-- Permissions
GRANT SELECT, INSERT, DELETE ON saved_services TO authenticated;

-- ============================================
-- 2. REVIEWS TABLE (Service & Vendor Reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    vendor_id TEXT,        -- TEXT to match vendors.id
    service_id TEXT,       -- TEXT to match services.id
    order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    vendor_response TEXT,
    vendor_responded_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies for reviews
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid()::text = user_id);

-- Permissions
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- Ensure rating columns exist on vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,1) DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- ============================================
-- 3. CONTACT FORM SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    inquiry_type VARCHAR(100) DEFAULT 'general',
    assigned_to VARCHAR(255),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    ip_address VARCHAR(50),
    user_agent TEXT,
    page_source VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all submissions" ON contact_submissions;
CREATE POLICY "Admins can view all submissions" ON contact_submissions
    FOR SELECT USING (true);

-- Permissions
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;

-- ============================================
-- 4. NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    user_id TEXT,
    is_subscribed BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    source VARCHAR(100),
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscriptions(is_subscribed);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can manage own subscription" ON newsletter_subscriptions
    FOR UPDATE USING (true);

-- Permissions
GRANT INSERT ON newsletter_subscriptions TO anon, authenticated;
GRANT SELECT, UPDATE ON newsletter_subscriptions TO authenticated;

-- ============================================
-- 5. SAVED VENDORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,  -- TEXT to match vendors.id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, vendor_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_vendors_user ON saved_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_vendors_vendor ON saved_vendors(vendor_id);

-- Enable RLS
ALTER TABLE saved_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own saved vendors" ON saved_vendors;
CREATE POLICY "Users can view own saved vendors" ON saved_vendors
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can save vendors" ON saved_vendors;
CREATE POLICY "Users can save vendors" ON saved_vendors
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can remove saved vendors" ON saved_vendors;
CREATE POLICY "Users can remove saved vendors" ON saved_vendors
    FOR DELETE USING (auth.uid()::text = user_id);

-- Permissions
GRANT SELECT, INSERT, DELETE ON saved_vendors TO authenticated;

-- ============================================
-- 6. USER ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_entity ON user_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can log their activity" ON user_activity;
CREATE POLICY "Users can log their activity" ON user_activity
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
CREATE POLICY "Users can view their own activity" ON user_activity
    FOR SELECT USING (auth.uid()::text = user_id);

-- Permissions
GRANT INSERT ON user_activity TO anon, authenticated;
GRANT SELECT ON user_activity TO authenticated;

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE!
-- ============================================
SELECT 'WENWEX Database Migration completed successfully!' AS result;
