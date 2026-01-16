-- ===========================================
-- WENVEX SITE SETTINGS TABLE
-- ===========================================
-- Run this in Supabase SQL Editor to create the site_settings table
-- This enables Super Admin to edit all buyer-facing content without code

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (buyer website needs to read these)
CREATE POLICY "Allow public read access" ON site_settings
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to update (for admin)
CREATE POLICY "Allow authenticated update" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default values
INSERT INTO site_settings (key, value) VALUES
    -- Brand & Identity
    ('site_name', 'WENVEX'),
    ('site_tagline', 'Global Tech Commerce Hub'),
    ('site_description', 'Empowering the world''s most innovative companies through elite technology partnerships.'),
    ('logo_url', '/logo.svg'),
    ('favicon_url', '/favicon.ico'),
    ('primary_color', '#6366f1'),
    
    -- Hero Section
    ('hero_title', 'Global Tech Commerce Hub.'),
    ('hero_subtitle', 'Empowering the world''s most innovative companies through elite technology partnerships, global scalability, and production-grade excellence.'),
    ('hero_cta_primary_text', 'Get Started'),
    ('hero_cta_primary_link', '/services'),
    ('hero_cta_secondary_text', 'View Global Agencies'),
    ('hero_cta_secondary_link', '/vendors'),
    ('hero_banner_image', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'),
    
    -- Platform Statistics
    ('stat_agencies', '500+'),
    ('stat_agencies_label', 'Verified Agencies'),
    ('stat_services', '10K+'),
    ('stat_services_label', 'Services Listed'),
    ('stat_clients', '50K+'),
    ('stat_clients_label', 'Happy Clients'),
    ('stat_rating', '4.9'),
    ('stat_rating_label', 'Average Rating'),
    
    -- Contact Information
    ('contact_email', 'support@wenvex.online'),
    ('contact_phone', '+91 9876543210'),
    ('contact_address', 'Hyderabad, Telangana, India'),
    ('support_email', 'help@wenvex.online'),
    
    -- Social Media Links
    ('social_facebook', 'https://facebook.com/wenvex'),
    ('social_twitter', 'https://twitter.com/wenvex'),
    ('social_instagram', 'https://instagram.com/wenvex'),
    ('social_linkedin', 'https://linkedin.com/company/wenvex'),
    ('social_youtube', 'https://youtube.com/wenvex'),
    
    -- Footer Content
    ('footer_copyright', '© 2024 WENVEX. All rights reserved.'),
    ('footer_tagline', 'Connecting global talent with world-class opportunities.')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;
