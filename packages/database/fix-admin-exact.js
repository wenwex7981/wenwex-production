
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FIXING ADMIN TABLES TO MATCH FRONTEND EXACTLY ===\n');

        // ========== 1. DROP AND RECREATE FEATURE_FLAGS WITH CORRECT COLUMNS ==========
        console.log('1. Recreating feature_flags with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS feature_flags CASCADE;');
        await client.query(`
      CREATE TABLE feature_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        feature_key TEXT UNIQUE NOT NULL,
        feature_name TEXT NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT true,
        applies_to TEXT DEFAULT 'all',
        category TEXT DEFAULT 'general',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ feature_flags recreated');

        // ========== 2. DROP AND RECREATE ROLE_PERMISSIONS WITH CORRECT COLUMNS ==========
        console.log('2. Recreating role_permissions with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS role_permissions CASCADE;');
        await client.query(`
      CREATE TABLE role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL,
        permission_key TEXT NOT NULL,
        permission_name TEXT NOT NULL,
        description TEXT,
        is_allowed BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(role, permission_key)
      );
    `);
        console.log('   ✅ role_permissions recreated');

        // ========== 3. DROP AND RECREATE PLATFORM_CONFIG WITH CORRECT COLUMNS ==========
        console.log('3. Recreating platform_config with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS platform_config CASCADE;');
        await client.query(`
      CREATE TABLE platform_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT,
        config_type TEXT DEFAULT 'string',
        category TEXT DEFAULT 'general',
        label TEXT,
        description TEXT,
        is_sensitive BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ platform_config recreated');

        // ========== 4. DROP AND RECREATE NAVIGATION_MENUS ==========
        console.log('4. Recreating navigation_menus with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS navigation_menus CASCADE;');
        await client.query(`
      CREATE TABLE navigation_menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_location TEXT NOT NULL,
        label TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        is_visible BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ navigation_menus recreated');

        // ========== 5. FIX ANNOUNCEMENTS TABLE ==========
        console.log('5. Recreating announcements with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS announcements CASCADE;');
        await client.query(`
      CREATE TABLE announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        is_active BOOLEAN DEFAULT true,
        bg_color TEXT DEFAULT '#3B82F6',
        text_color TEXT DEFAULT '#FFFFFF',
        display_order INT DEFAULT 0,
        starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ends_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ announcements recreated');

        // ========== 6. CREATE ADMIN_AUDIT_LOG (frontend expects this name) ==========
        console.log('6. Recreating admin_audit_log with exact frontend column names...');
        await client.query('DROP TABLE IF EXISTS admin_audit_log CASCADE;');
        await client.query(`
      CREATE TABLE admin_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID,
        admin_email TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        old_value JSONB,
        new_value JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ admin_audit_log recreated');

        // ========== 7. SEED FEATURE FLAGS ==========
        console.log('\n7. Seeding feature flags...');
        const flags = [
            { key: 'vendor_registration', name: 'Vendor Registration', category: 'auth', desc: 'Allow new vendor sign-ups', applies: 'all' },
            { key: 'service_submissions', name: 'Service Submissions', category: 'services', desc: 'Allow vendors to submit new services', applies: 'vendor' },
            { key: 'user_reviews', name: 'User Reviews', category: 'services', desc: 'Enable buyer reviews on services', applies: 'buyer' },
            { key: 'chat_system', name: 'Chat System', category: 'messaging', desc: 'Enable real-time chat between buyers and vendors', applies: 'all' },
            { key: 'shorts_reels', name: 'Shorts/Reels', category: 'services', desc: 'Enable video shorts feature', applies: 'vendor' },
            { key: 'academic_services', name: 'Academic Services', category: 'services', desc: 'Show academic service category', applies: 'all' },
            { key: 'payment_gateway', name: 'Payment Gateway', category: 'payments', desc: 'Enable payment processing', applies: 'all' },
            { key: 'email_notifications', name: 'Email Notifications', category: 'general', desc: 'Send email notifications', applies: 'all' },
            { key: 'portfolio_uploads', name: 'Portfolio Uploads', category: 'services', desc: 'Allow vendors to upload portfolio items', applies: 'vendor' },
            { key: 'subscription_plans', name: 'Subscription Plans', category: 'payments', desc: 'Enable vendor subscription tiers', applies: 'vendor' }
        ];

        for (const f of flags) {
            await client.query(`
        INSERT INTO feature_flags (id, feature_key, feature_name, description, is_enabled, applies_to, category, config)
        VALUES ($1, $2, $3, $4, true, $5, $6, '{}')
      `, [uuidv4(), f.key, f.name, f.desc, f.applies, f.category]);
        }
        console.log('   ✅ 10 feature flags seeded');

        // ========== 8. SEED ROLE PERMISSIONS ==========
        console.log('8. Seeding role permissions...');
        const perms = [
            // BUYER permissions
            { role: 'BUYER', key: 'view_services', name: 'View Services', desc: 'Browse and view services' },
            { role: 'BUYER', key: 'submit_reviews', name: 'Submit Reviews', desc: 'Leave reviews on services' },
            { role: 'BUYER', key: 'save_services', name: 'Save Services', desc: 'Add services to favorites' },
            { role: 'BUYER', key: 'send_messages', name: 'Send Messages', desc: 'Message vendors' },
            // VENDOR permissions
            { role: 'VENDOR', key: 'manage_services', name: 'Manage Services', desc: 'Create and edit own services' },
            { role: 'VENDOR', key: 'manage_portfolio', name: 'Manage Portfolio', desc: 'Upload portfolio items' },
            { role: 'VENDOR', key: 'upload_shorts', name: 'Upload Shorts', desc: 'Upload video shorts' },
            { role: 'VENDOR', key: 'view_analytics', name: 'View Analytics', desc: 'Access performance analytics' },
            // SUPER_ADMIN permissions
            { role: 'SUPER_ADMIN', key: 'manage_vendors', name: 'Manage Vendors', desc: 'Full vendor management' },
            { role: 'SUPER_ADMIN', key: 'manage_users', name: 'Manage Users', desc: 'Full user management' },
            { role: 'SUPER_ADMIN', key: 'manage_categories', name: 'Manage Categories', desc: 'Edit categories' },
            { role: 'SUPER_ADMIN', key: 'manage_settings', name: 'Manage Settings', desc: 'Platform settings access' },
            { role: 'SUPER_ADMIN', key: 'access_control', name: 'Access Control', desc: 'Manage feature flags and permissions' }
        ];

        for (const p of perms) {
            await client.query(`
        INSERT INTO role_permissions (id, role, permission_key, permission_name, description, is_allowed)
        VALUES ($1, $2, $3, $4, $5, true)
      `, [uuidv4(), p.role, p.key, p.name, p.desc]);
        }
        console.log('   ✅ 13 role permissions seeded');

        // ========== 9. SEED PLATFORM CONFIG ==========
        console.log('9. Seeding platform config...');
        const configs = [
            { key: 'platform_name', value: 'WENVEX', type: 'string', category: 'branding', label: 'Platform Name', desc: 'Main platform name', sensitive: false },
            { key: 'platform_tagline', value: 'Global Tech Commerce Hub', type: 'string', category: 'branding', label: 'Tagline', desc: 'Platform tagline', sensitive: false },
            { key: 'support_email', value: 'support@wenvex.online', type: 'string', category: 'contact', label: 'Support Email', desc: 'Customer support email', sensitive: false },
            { key: 'support_phone', value: '+91 7981994870', type: 'string', category: 'contact', label: 'Support Phone', desc: 'Customer support phone', sensitive: false },
            { key: 'min_service_price', value: '5', type: 'number', category: 'pricing', label: 'Minimum Price', desc: 'Minimum service price in USD', sensitive: false },
            { key: 'max_service_price', value: '100000', type: 'number', category: 'pricing', label: 'Maximum Price', desc: 'Maximum service price in USD', sensitive: false },
            { key: 'vendor_commission', value: '10', type: 'number', category: 'pricing', label: 'Commission Rate (%)', desc: 'Vendor commission percentage', sensitive: false },
            { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', label: 'Maintenance Mode', desc: 'Put site in maintenance mode', sensitive: false },
            { key: 'allow_guest_checkout', value: 'false', type: 'boolean', category: 'general', label: 'Guest Checkout', desc: 'Allow purchases without account', sensitive: false }
        ];

        for (const c of configs) {
            await client.query(`
        INSERT INTO platform_config (id, config_key, config_value, config_type, category, label, description, is_sensitive)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [uuidv4(), c.key, c.value, c.type, c.category, c.label, c.desc, c.sensitive]);
        }
        console.log('   ✅ 9 platform configs seeded');

        // ========== 10. SEED NAVIGATION MENUS ==========
        console.log('10. Seeding navigation menus...');
        const navs = [
            { location: 'header', label: 'Services', url: '/services', order: 1 },
            { location: 'header', label: 'Vendors', url: '/vendors', order: 2 },
            { location: 'header', label: 'Academic', url: '/academic', order: 3 },
            { location: 'header', label: 'Shorts', url: '/shorts', order: 4 },
            { location: 'footer', label: 'About Us', url: '/about', order: 1 },
            { location: 'footer', label: 'Contact', url: '/contact', order: 2 },
            { location: 'footer', label: 'Privacy Policy', url: '/privacy', order: 3 },
            { location: 'footer', label: 'Terms of Service', url: '/terms', order: 4 }
        ];

        for (const n of navs) {
            await client.query(`
        INSERT INTO navigation_menus (id, menu_location, label, url, is_visible, display_order)
        VALUES ($1, $2, $3, $4, true, $5)
      `, [uuidv4(), n.location, n.label, n.url, n.order]);
        }
        console.log('   ✅ 8 navigation items seeded');

        // ========== 11. GRANT PERMISSIONS ==========
        console.log('\n11. Granting permissions...');
        const tables = ['feature_flags', 'role_permissions', 'platform_config', 'navigation_menus', 'announcements', 'admin_audit_log'];
        for (const table of tables) {
            await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${table} TO anon, authenticated;`);
        }
        console.log('    ✅ Permissions granted');

        // ========== 12. RELOAD SCHEMA CACHE ==========
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('\n🚀 ALL ADMIN TABLES FIXED WITH EXACT FRONTEND COLUMN NAMES!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
