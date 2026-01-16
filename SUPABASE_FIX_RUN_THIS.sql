-- =============================================
-- WENWEX CHAT SYSTEM - STANDALONE SETUP
-- =============================================
-- This creates a STANDALONE chat system that works
-- without strict foreign key dependencies
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================

-- STEP 1: Drop existing chat tables if they have issues
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

-- STEP 2: Create chat_conversations table (NO FOREIGN KEYS)
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,          -- Stores Supabase Auth user ID
    vendor_id UUID NOT NULL,          -- Stores vendor table ID
    service_id UUID,                  -- Optional: related service
    status VARCHAR(50) DEFAULT 'OPEN',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create chat_messages table (NO FOREIGN KEYS except to conversations)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,          -- Stores Supabase Auth user ID
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create indexes for performance
CREATE INDEX idx_chat_conv_buyer ON chat_conversations(buyer_id);
CREATE INDEX idx_chat_conv_vendor ON chat_conversations(vendor_id);
CREATE INDEX idx_chat_conv_updated ON chat_conversations(updated_at DESC);
CREATE INDEX idx_chat_msg_conv ON chat_messages(conversation_id);
CREATE INDEX idx_chat_msg_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_msg_created ON chat_messages(created_at);

-- STEP 5: Disable RLS (for development - enable with proper policies in production)
ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- STEP 6: Grant full access (for development)
GRANT ALL ON chat_conversations TO authenticated;
GRANT ALL ON chat_conversations TO anon;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON chat_messages TO anon;

-- STEP 7: Enable realtime for chat tables
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- =============================================
-- ALSO FIX SERVICES TABLE COLUMNS
-- =============================================

-- Add service_type column
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type VARCHAR(100) DEFAULT 'IT & TECH';

-- Add delivery_days column  
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 7;

-- Add revisions column
ALTER TABLE services ADD COLUMN IF NOT EXISTS revisions INTEGER DEFAULT 0;

-- Add tech_stack column
ALTER TABLE services ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';

-- Add features column
ALTER TABLE services ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Add other useful columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- =============================================
-- FIX VENDORS TABLE - Add missing columns
-- =============================================

-- Add certifications column (JSONB array)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';

-- Add documents column (JSONB array)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- Add social_links column (JSONB object)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"linkedin":"","twitter":"","instagram":"","facebook":""}';

-- Add founded_year column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS founded_year VARCHAR(20);

-- Add team_size column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS team_size VARCHAR(50);

-- Add projects_done column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS projects_done VARCHAR(50);

-- Add satisfaction_rate column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS satisfaction_rate VARCHAR(20) DEFAULT '98%';

-- Add banner_url column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add country column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United States';

-- Add phone_number column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- Add website_url column  
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add email column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add rating column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0;

-- Add total_reviews column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Add followers_count column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Add response_time column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS response_time VARCHAR(100) DEFAULT 'Usually responds within 2 hours';

-- Add whatsapp_number column for WhatsApp integration
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);

-- =============================================
-- DYNAMIC FIELDS TABLE - For Admin Field Management
-- =============================================

-- Create dynamic_fields table for storing custom field definitions
CREATE TABLE IF NOT EXISTS dynamic_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- 'vendors', 'services', 'categories', 'users', etc.
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL DEFAULT 'text', -- text, number, email, url, textarea, select, checkbox, date, file, json
    field_options JSONB DEFAULT '{}', -- For select dropdowns: {options: ["opt1", "opt2"]}
    placeholder VARCHAR(255),
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    section VARCHAR(100) DEFAULT 'general', -- For grouping fields: 'general', 'contact', 'social', etc.
    validation_rules JSONB DEFAULT '{}', -- {min: 0, max: 100, pattern: "regex"}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, field_name)
);

-- Create indexes for dynamic_fields
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_entity ON dynamic_fields(entity_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_order ON dynamic_fields(entity_type, display_order);

-- Grant access to dynamic_fields
GRANT ALL ON dynamic_fields TO authenticated;
GRANT ALL ON dynamic_fields TO anon;

-- Disable RLS for development
ALTER TABLE dynamic_fields DISABLE ROW LEVEL SECURITY;

-- Insert some default dynamic fields as examples
INSERT INTO dynamic_fields (entity_type, field_name, field_label, field_type, placeholder, section, display_order)
VALUES 
    ('vendors', 'tagline', 'Company Tagline', 'text', 'Enter a short tagline', 'general', 1),
    ('vendors', 'specializations', 'Specializations', 'textarea', 'List your specializations', 'general', 2),
    ('services', 'support_duration', 'Support Duration', 'text', 'e.g., 3 months', 'pricing', 1),
    ('services', 'includes_source_code', 'Includes Source Code', 'checkbox', '', 'features', 1)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- =============================================
-- SUBSCRIPTION PLANS TABLE - Admin Editable Pricing
-- =============================================

-- Create subscription_plans table for storing pricing plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_period VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'one_time'
    services_limit INTEGER DEFAULT 5, -- Number of services allowed
    features JSONB DEFAULT '[]', -- Array of feature strings
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    badge_text VARCHAR(50), -- e.g., "Popular", "Best Value"
    badge_color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_order ON subscription_plans(display_order);

-- Grant access to subscription_plans
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON subscription_plans TO anon;

-- Disable RLS for development
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, currency, billing_period, services_limit, features, is_popular, display_order, badge_text, badge_color)
VALUES 
    ('Starter', 'starter', 'Perfect for individuals and small agencies', 1580.80, 'INR', 'monthly', 5, 
     '["Up to 5 services", "Basic analytics", "Email support", "Standard listing", "Portfolio showcase"]'::jsonb,
     FALSE, 1, NULL, NULL),
    ('Professional', 'professional', 'Best for growing agencies', 4076.80, 'INR', 'monthly', 25, 
     '["Up to 25 services", "Advanced analytics", "Priority support", "Featured listing", "Portfolio & Shorts", "Verified badge", "Custom branding"]'::jsonb,
     TRUE, 2, 'Popular', 'yellow'),
    ('Enterprise', 'enterprise', 'For large agencies and teams', 8236.80, 'INR', 'monthly', -1, 
     '["Unlimited services", "Premium analytics", "Dedicated support", "Top featured listing", "All Professional features", "API access", "White-label options", "Custom integrations"]'::jsonb,
     FALSE, 3, 'Best Value', 'green')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_popular = EXCLUDED.is_popular,
    display_order = EXCLUDED.display_order,
    badge_text = EXCLUDED.badge_text,
    badge_color = EXCLUDED.badge_color,
    updated_at = NOW();

-- Add subscription fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'pending'; -- pending, active, expired, cancelled
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- =============================================
-- SCHEMA CACHE RELOAD
-- =============================================
-- This notifies PostgREST to reload the schema cache so new columns are visible immediately
NOTIFY pgrst, 'reload schema';

-- =============================================
-- VERIFY SETUP
-- =============================================
-- Run this to check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name IN ('payment_proof_url', 'subscription_status', 'subscription_plan_id');

SELECT 'Chat tables:' AS info;
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'chat_%';

SELECT 'Vendor columns added:' AS info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name IN ('certifications', 'documents', 'social_links', 'founded_year', 'team_size');

SELECT 'Services columns added:' AS info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('service_type', 'delivery_days', 'revisions', 'tech_stack', 'features');

SELECT '✅ ALL DATABASE FIXES COMPLETE!' AS result;
