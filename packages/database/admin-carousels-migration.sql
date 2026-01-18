-- =====================================================
-- ADMIN-EDITABLE CAROUSEL TABLES
-- Run this in Supabase SQL Editor to enable admin control
-- =====================================================

-- Promo Carousel Slides Table
CREATE TABLE IF NOT EXISTS promo_carousel_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    gradient_from VARCHAR(50) DEFAULT '#6366f1',
    gradient_to VARCHAR(50) DEFAULT '#8b5cf6',
    cta_text VARCHAR(100) DEFAULT 'Learn More',
    cta_link VARCHAR(255) DEFAULT '/services',
    badge_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsored Carousel Items Table
CREATE TABLE IF NOT EXISTS sponsored_carousel_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    sponsor_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    cta_text VARCHAR(100) DEFAULT 'Learn More',
    cta_link VARCHAR(255) DEFAULT '#',
    tag VARCHAR(100) DEFAULT 'Featured',
    color_from VARCHAR(50) DEFAULT '#6366f1',
    color_to VARCHAR(50) DEFAULT '#8b5cf6',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promo_carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_carousel_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, Admin write
CREATE POLICY "promo_carousel_public_read" ON promo_carousel_slides 
    FOR SELECT USING (true);

CREATE POLICY "promo_carousel_admin_all" ON promo_carousel_slides 
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "sponsored_carousel_public_read" ON sponsored_carousel_items 
    FOR SELECT USING (true);

CREATE POLICY "sponsored_carousel_admin_all" ON sponsored_carousel_items 
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Insert default promo slides
INSERT INTO promo_carousel_slides (title, subtitle, description, image_url, gradient_from, gradient_to, cta_text, cta_link, badge_text, display_order) VALUES
('New Year Sale', 'Up to 50% Off', 'Get amazing discounts on all services this holiday season', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000', '#6366f1', '#8b5cf6', 'Shop Now', '/services', 'Limited Time', 1),
('Premium Agencies', 'Verified Partners', 'Connect with top-tier agencies for enterprise projects', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2000', '#059669', '#10b981', 'View Agencies', '/vendors', 'Top Rated', 2),
('Academic Projects', 'Expert Help', 'Get professional assistance for your academic projects', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=2000', '#dc2626', '#f97316', 'Explore', '/academic', 'Student Special', 3)
ON CONFLICT DO NOTHING;

-- Insert default sponsored items
INSERT INTO sponsored_carousel_items (title, sponsor_name, description, image_url, cta_text, cta_link, tag, color_from, color_to, display_order) VALUES
('Cloud Infrastructure Summit 2024', 'AWS', 'Join the worlds leading cloud providers for a 3-day virtual summit.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000', 'Register Free', '#', 'Featured Event', '#2563eb', '#06b6d4', 1),
('Next-Gen AI Development Tools', 'NVIDIA', 'Accelerate your AI workflows with cutting-edge technology.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=2000', 'Learn More', '#', 'Product Launch', '#059669', '#10b981', 2),
('Global Freelancer Awards', 'WENWEX', 'Celebrating the top 1% of talent on our platform.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=2000', 'Nominate Now', '#', 'Community', '#7c3aed', '#a855f7', 3)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON promo_carousel_slides TO anon, authenticated;
GRANT SELECT ON sponsored_carousel_items TO anon, authenticated;
GRANT ALL ON promo_carousel_slides TO service_role;
GRANT ALL ON sponsored_carousel_items TO service_role;
