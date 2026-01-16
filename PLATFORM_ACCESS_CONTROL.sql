-- ===========================================
-- WENVEX PLATFORM ACCESS CONTROL SYSTEM
-- ===========================================
-- Run this in Supabase SQL Editor
-- This enables Super Admin to control ALL platform aspects without code changes
-- Production-Grade Access Control for Enterprise Platform

-- ===========================================
-- 1. FEATURE FLAGS TABLE
-- ===========================================
-- Control which features are enabled/disabled across the platform

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key VARCHAR(255) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    applies_to VARCHAR(50) DEFAULT 'all', -- 'buyer', 'vendor', 'admin', 'all'
    category VARCHAR(100) DEFAULT 'general', -- 'auth', 'services', 'payments', 'messaging', 'general'
    config JSONB DEFAULT '{}', -- Additional configuration for the feature
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- Insert default feature flags
INSERT INTO feature_flags (feature_key, feature_name, description, is_enabled, applies_to, category) VALUES
    -- Authentication Features
    ('auth_email_login', 'Email Login', 'Allow users to login with email and password', true, 'all', 'auth'),
    ('auth_google_oauth', 'Google OAuth', 'Allow users to login with Google account', true, 'all', 'auth'),
    ('auth_email_verification', 'Email Verification', 'Require email verification for new accounts', true, 'all', 'auth'),
    ('auth_two_factor', 'Two-Factor Authentication', 'Enable 2FA option for users', false, 'all', 'auth'),
    ('auth_registration_open', 'Open Registration', 'Allow new user registrations', true, 'all', 'auth'),
    
    -- Buyer Features
    ('buyer_can_message', 'Buyer Messaging', 'Allow buyers to message vendors', true, 'buyer', 'messaging'),
    ('buyer_can_review', 'Buyer Reviews', 'Allow buyers to leave reviews on services', true, 'buyer', 'services'),
    ('buyer_can_save_services', 'Save Services', 'Allow buyers to save/bookmark services', true, 'buyer', 'services'),
    ('buyer_can_follow_vendors', 'Follow Vendors', 'Allow buyers to follow agencies', true, 'buyer', 'services'),
    ('buyer_checkout_enabled', 'Buyer Checkout', 'Enable the checkout/booking flow', true, 'buyer', 'payments'),
    
    -- Vendor Features
    ('vendor_registration_open', 'Vendor Registration', 'Allow new vendor registrations', true, 'vendor', 'auth'),
    ('vendor_can_upload_services', 'Service Uploads', 'Allow vendors to create/upload services', true, 'vendor', 'services'),
    ('vendor_can_upload_shorts', 'Shorts Uploads', 'Allow vendors to upload short videos', true, 'vendor', 'services'),
    ('vendor_can_upload_portfolio', 'Portfolio Uploads', 'Allow vendors to add portfolio items', true, 'vendor', 'services'),
    ('vendor_can_message', 'Vendor Messaging', 'Allow vendors to message buyers', true, 'vendor', 'messaging'),
    ('vendor_analytics_enabled', 'Vendor Analytics', 'Show analytics dashboard to vendors', true, 'vendor', 'general'),
    
    -- Platform Features
    ('shorts_section_visible', 'Shorts Section', 'Show shorts/reels section on homepage', true, 'buyer', 'general'),
    ('academic_section_visible', 'Academic Section', 'Show academic services section', true, 'buyer', 'general'),
    ('trending_section_visible', 'Trending Section', 'Show trending services on homepage', true, 'buyer', 'general'),
    ('featured_agencies_visible', 'Featured Agencies', 'Show featured agencies on homepage', true, 'buyer', 'general'),
    ('search_enabled', 'Global Search', 'Enable search functionality', true, 'all', 'general'),
    ('notifications_enabled', 'Notifications', 'Enable notification system', true, 'all', 'general'),
    ('chat_enabled', 'Live Chat', 'Enable real-time chat between buyers and vendors', true, 'all', 'messaging'),
    
    -- Payment Features
    ('payments_enabled', 'Payment System', 'Enable payment processing', true, 'all', 'payments'),
    ('subscriptions_enabled', 'Vendor Subscriptions', 'Enable vendor subscription system', true, 'vendor', 'payments'),
    ('free_trial_enabled', 'Free Trial', 'Enable free trial for vendors', true, 'vendor', 'payments')
ON CONFLICT (feature_key) DO NOTHING;

-- ===========================================
-- 2. ROLE PERMISSIONS TABLE
-- ===========================================
-- Fine-grained permission control for each role

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role VARCHAR(50) NOT NULL, -- 'BUYER', 'VENDOR', 'SUPER_ADMIN'
    permission_key VARCHAR(255) NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- Insert default permissions
INSERT INTO role_permissions (role, permission_key, permission_name, description, is_allowed) VALUES
    -- Buyer Permissions
    ('BUYER', 'view_services', 'View Services', 'Browse and view service listings', true),
    ('BUYER', 'view_vendors', 'View Vendors', 'Browse and view vendor profiles', true),
    ('BUYER', 'view_shorts', 'View Shorts', 'Watch short videos/reels', true),
    ('BUYER', 'create_review', 'Create Reviews', 'Submit reviews for services', true),
    ('BUYER', 'save_services', 'Save Services', 'Bookmark services for later', true),
    ('BUYER', 'follow_vendors', 'Follow Vendors', 'Follow vendor accounts', true),
    ('BUYER', 'send_messages', 'Send Messages', 'Message vendors', true),
    ('BUYER', 'make_purchase', 'Make Purchases', 'Complete checkout and order services', true),
    ('BUYER', 'view_academic', 'View Academic', 'Access academic services section', true),
    
    -- Vendor Permissions
    ('VENDOR', 'create_service', 'Create Services', 'Add new service listings', true),
    ('VENDOR', 'edit_service', 'Edit Services', 'Modify own service listings', true),
    ('VENDOR', 'delete_service', 'Delete Services', 'Remove own service listings', true),
    ('VENDOR', 'upload_media', 'Upload Media', 'Upload images and videos', true),
    ('VENDOR', 'create_short', 'Create Shorts', 'Upload short videos/reels', true),
    ('VENDOR', 'add_portfolio', 'Add Portfolio', 'Add portfolio items', true),
    ('VENDOR', 'view_analytics', 'View Analytics', 'Access dashboard analytics', true),
    ('VENDOR', 'respond_reviews', 'Respond to Reviews', 'Reply to buyer reviews', true),
    ('VENDOR', 'send_messages', 'Send Messages', 'Message buyers', true),
    ('VENDOR', 'manage_subscription', 'Manage Subscription', 'Change subscription plan', true),
    
    -- Super Admin Permissions (always true - for reference)
    ('SUPER_ADMIN', 'manage_users', 'Manage Users', 'Create, edit, delete users', true),
    ('SUPER_ADMIN', 'manage_vendors', 'Manage Vendors', 'Approve, reject, edit vendors', true),
    ('SUPER_ADMIN', 'manage_services', 'Manage Services', 'Moderate all services', true),
    ('SUPER_ADMIN', 'manage_categories', 'Manage Categories', 'Add, edit, delete categories', true),
    ('SUPER_ADMIN', 'manage_subscriptions', 'Manage Subscriptions', 'Edit subscription plans and pricing', true),
    ('SUPER_ADMIN', 'manage_content', 'Manage Content', 'Edit site content and settings', true),
    ('SUPER_ADMIN', 'manage_homepage', 'Manage Homepage', 'Configure homepage sections', true),
    ('SUPER_ADMIN', 'view_analytics', 'View Analytics', 'Access platform analytics', true),
    ('SUPER_ADMIN', 'manage_settings', 'Manage Settings', 'Access all platform settings', true),
    ('SUPER_ADMIN', 'manage_access_control', 'Manage Access Control', 'Control feature flags and permissions', true)
ON CONFLICT (role, permission_key) DO NOTHING;

-- ===========================================
-- 3. PLATFORM CONFIGURATION TABLE
-- ===========================================
-- Centralized platform configuration

CREATE TABLE IF NOT EXISTS platform_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(100) DEFAULT 'general',
    label VARCHAR(255) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false, -- Don't expose in public APIs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_config_key ON platform_config(config_key);
CREATE INDEX IF NOT EXISTS idx_platform_config_category ON platform_config(category);

-- Insert default configurations
INSERT INTO platform_config (config_key, config_value, config_type, category, label, description, is_sensitive) VALUES
    -- General Settings
    ('platform_name', 'WENVEX', 'string', 'general', 'Platform Name', 'The name of the platform', false),
    ('platform_tagline', 'Global Tech Commerce Hub', 'string', 'general', 'Platform Tagline', 'Main tagline/slogan', false),
    ('maintenance_mode', 'false', 'boolean', 'general', 'Maintenance Mode', 'Put site in maintenance mode', false),
    ('maintenance_message', 'We are currently performing scheduled maintenance. Please check back soon.', 'string', 'general', 'Maintenance Message', 'Message shown during maintenance', false),
    
    -- Registration Settings
    ('buyer_registration_enabled', 'true', 'boolean', 'registration', 'Buyer Registration', 'Allow new buyer sign ups', false),
    ('vendor_registration_enabled', 'true', 'boolean', 'registration', 'Vendor Registration', 'Allow new vendor registrations', false),
    ('require_email_verification', 'true', 'boolean', 'registration', 'Require Email Verification', 'Verify email before account activation', false),
    ('auto_approve_vendors', 'false', 'boolean', 'registration', 'Auto-Approve Vendors', 'Automatically approve vendor applications', false),
    
    -- Service Settings
    ('max_services_per_vendor', '50', 'number', 'services', 'Max Services Per Vendor', 'Maximum services a vendor can list', false),
    ('max_images_per_service', '10', 'number', 'services', 'Max Images Per Service', 'Maximum images per service listing', false),
    ('max_service_price', '100000', 'number', 'services', 'Max Service Price', 'Maximum price for a service (USD)', false),
    ('min_service_price', '10', 'number', 'services', 'Min Service Price', 'Minimum price for a service (USD)', false),
    ('require_service_approval', 'true', 'boolean', 'services', 'Require Service Approval', 'Admin must approve new services', false),
    
    -- Upload Limits
    ('max_image_size_mb', '5', 'number', 'uploads', 'Max Image Size (MB)', 'Maximum image file size in MB', false),
    ('max_video_size_mb', '100', 'number', 'uploads', 'Max Video Size (MB)', 'Maximum video file size in MB', false),
    ('max_document_size_mb', '10', 'number', 'uploads', 'Max Document Size (MB)', 'Maximum document file size in MB', false),
    ('allowed_image_types', 'image/jpeg,image/png,image/webp,image/gif', 'string', 'uploads', 'Allowed Image Types', 'Comma-separated MIME types', false),
    ('allowed_video_types', 'video/mp4,video/webm', 'string', 'uploads', 'Allowed Video Types', 'Comma-separated MIME types', false),
    
    -- Shorts Settings
    ('max_short_duration_seconds', '60', 'number', 'shorts', 'Max Short Duration', 'Maximum video length for shorts (seconds)', false),
    ('shorts_per_page', '10', 'number', 'shorts', 'Shorts Per Page', 'Number of shorts to load at a time', false),
    ('shorts_enabled', 'true', 'boolean', 'shorts', 'Shorts Enabled', 'Enable the shorts/reels feature', false),
    
    -- Review Settings
    ('require_purchase_for_review', 'false', 'boolean', 'reviews', 'Require Purchase for Review', 'Only allow reviews after purchase', false),
    ('allow_vendor_response', 'true', 'boolean', 'reviews', 'Allow Vendor Response', 'Vendors can respond to reviews', false),
    ('min_review_length', '10', 'number', 'reviews', 'Min Review Length', 'Minimum characters for a review', false),
    
    -- Rate Limits
    ('api_rate_limit_per_minute', '100', 'number', 'security', 'API Rate Limit', 'API requests per minute per IP', false),
    ('auth_rate_limit_per_minute', '10', 'number', 'security', 'Auth Rate Limit', 'Login attempts per minute per IP', false),
    ('upload_rate_limit_per_hour', '50', 'number', 'security', 'Upload Rate Limit', 'File uploads per hour per user', false),
    ('search_rate_limit_per_minute', '30', 'number', 'security', 'Search Rate Limit', 'Search requests per minute per user', false),
    
    -- Subscription Settings
    ('free_trial_days', '14', 'number', 'subscriptions', 'Free Trial Days', 'Number of days for vendor free trial', false),
    ('grace_period_days', '7', 'number', 'subscriptions', 'Grace Period Days', 'Days after subscription expires before restricting access', false),
    
    -- SEO Settings
    ('default_meta_title', 'WENVEX - Global Tech Commerce Marketplace', 'string', 'seo', 'Default Meta Title', 'Default page title for SEO', false),
    ('default_meta_description', 'Find verified agencies for IT services, web development, mobile apps, and academic projects.', 'string', 'seo', 'Default Meta Description', 'Default meta description for SEO', false),
    ('google_analytics_id', '', 'string', 'seo', 'Google Analytics ID', 'GA tracking ID (e.g., G-XXXXXXXXXX)', true),
    
    -- Email Settings
    ('admin_email', 'admin@wenvex.online', 'string', 'email', 'Admin Email', 'Primary admin notification email', false),
    ('support_email', 'support@wenvex.online', 'string', 'email', 'Support Email', 'Customer support email', false),
    ('noreply_email', 'noreply@wenvex.online', 'string', 'email', 'No-Reply Email', 'Sender email for automated messages', false)
ON CONFLICT (config_key) DO NOTHING;

-- ===========================================
-- 4. NAVIGATION MENU TABLE
-- ===========================================
-- Super Admin can control navigation menus

CREATE TABLE IF NOT EXISTS navigation_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_location VARCHAR(100) NOT NULL, -- 'header', 'footer', 'mobile'
    label VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(100),
    is_visible BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    requires_auth BOOLEAN DEFAULT false,
    allowed_roles TEXT[] DEFAULT '{}', -- Empty means all roles
    display_order INT DEFAULT 0,
    parent_id UUID REFERENCES navigation_menus(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_navigation_menus_location ON navigation_menus(menu_location);

-- Insert default navigation items
INSERT INTO navigation_menus (menu_location, label, url, display_order, is_visible) VALUES
    ('header', 'Services', '/services', 1, true),
    ('header', 'Categories', '/categories', 2, true),
    ('header', 'Vendors', '/vendors', 3, true),
    ('header', 'Academic', '/academic', 4, true),
    ('header', 'Shorts', '/shorts', 5, true),
    ('footer', 'About Us', '/about', 1, true),
    ('footer', 'Contact', '/contact', 2, true),
    ('footer', 'Privacy Policy', '/privacy', 3, true),
    ('footer', 'Terms of Service', '/terms', 4, true),
    ('footer', 'FAQ', '/faq', 5, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- 5. ANNOUNCEMENT BANNERS TABLE
-- ===========================================
-- Super Admin can create site-wide announcements

CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_active BOOLEAN DEFAULT true,
    is_dismissible BOOLEAN DEFAULT true,
    show_on TEXT[] DEFAULT '{buyer}', -- 'buyer', 'vendor', 'admin'
    bg_color VARCHAR(50) DEFAULT '#3b82f6',
    text_color VARCHAR(50) DEFAULT '#ffffff',
    link_url VARCHAR(500),
    link_text VARCHAR(100),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);

-- ===========================================
-- 6. AUDIT LOG TABLE (Enhanced)
-- ===========================================
-- Track all admin actions for security

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    admin_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_date ON admin_audit_log(created_at);

-- ===========================================
-- 7. API KEYS TABLE
-- ===========================================
-- Super Admin can generate API keys

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    key_hash VARCHAR(255) NOT NULL, -- Store hashed version
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    rate_limit INT DEFAULT 1000, -- Requests per hour
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);

-- ===========================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Public read policies (for non-sensitive data)
CREATE POLICY "Allow public read feature_flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Allow public read navigation_menus" ON navigation_menus FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read platform_config" ON platform_config FOR SELECT USING (is_sensitive = false);

-- Authenticated write policies (for admins)
CREATE POLICY "Allow auth write feature_flags" ON feature_flags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write role_permissions" ON role_permissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write platform_config" ON platform_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write navigation_menus" ON navigation_menus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth read admin_audit_log" ON admin_audit_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth insert admin_audit_log" ON admin_audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth write api_keys" ON api_keys FOR ALL USING (auth.role() = 'authenticated');

-- ===========================================
-- 9. GRANT PERMISSIONS
-- ===========================================

GRANT SELECT ON feature_flags TO anon;
GRANT SELECT ON navigation_menus TO anon;
GRANT SELECT ON announcements TO anon;
GRANT SELECT ON platform_config TO anon;

GRANT ALL ON feature_flags TO authenticated;
GRANT ALL ON role_permissions TO authenticated;
GRANT ALL ON platform_config TO authenticated;
GRANT ALL ON navigation_menus TO authenticated;
GRANT ALL ON announcements TO authenticated;
GRANT ALL ON admin_audit_log TO authenticated;
GRANT ALL ON api_keys TO authenticated;

-- ===========================================
-- COMPLETE! 
-- ===========================================
-- Super Admin now has complete access control over:
-- ✅ Feature Flags (enable/disable any feature)
-- ✅ Role Permissions (fine-grained access control)
-- ✅ Platform Configuration (all settings)
-- ✅ Navigation Menus (customize menus)
-- ✅ Announcements (site-wide banners)
-- ✅ Audit Logs (track all changes)
-- ✅ API Keys (external integrations)
