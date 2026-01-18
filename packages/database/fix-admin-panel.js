
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FIXING ADMIN PANEL (3002) - ALL TABLES ===\n');

        // ========== 1. CREATE FEATURE_FLAGS TABLE ==========
        console.log('1. Creating feature_flags table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        key TEXT UNIQUE NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT true,
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ feature_flags table created');

        // ========== 2. CREATE PLATFORM_CONFIG TABLE ==========
        console.log('2. Creating platform_config table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS platform_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'string',
        category TEXT DEFAULT 'general',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ platform_config table created');

        // ========== 3. CREATE NAVIGATION TABLE ==========
        console.log('3. Creating navigation table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS navigation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label TEXT NOT NULL,
        href TEXT NOT NULL,
        icon TEXT,
        parent_id UUID,
        "order" INT DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        role TEXT DEFAULT 'all',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ navigation table created');

        // ========== 4. CREATE ANNOUNCEMENTS TABLE ==========
        console.log('4. Creating announcements table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT,
        type TEXT DEFAULT 'info',
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        target_audience TEXT DEFAULT 'all',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ announcements table created');

        // ========== 5. CREATE AUDIT_LOG TABLE ==========
        console.log('5. Creating audit_log table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        old_data JSONB,
        new_data JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ audit_log table created');

        // ========== 6. CREATE ROLE_PERMISSIONS TABLE ==========
        console.log('6. Creating role_permissions table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL,
        permission TEXT NOT NULL,
        is_allowed BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(role, permission)
      );
    `);
        console.log('   ✅ role_permissions table created');

        // ========== 7. SEED DEFAULT FEATURE FLAGS ==========
        console.log('\n7. Seeding default feature flags...');
        const flags = [
            { name: 'Vendor Registration', key: 'vendor_registration', category: 'vendors', description: 'Allow new vendor sign-ups' },
            { name: 'Service Submissions', key: 'service_submissions', category: 'services', description: 'Allow vendors to submit new services' },
            { name: 'User Reviews', key: 'user_reviews', category: 'buyers', description: 'Enable buyer reviews on services' },
            { name: 'Chat System', key: 'chat_system', category: 'communication', description: 'Enable real-time chat' },
            { name: 'Shorts/Reels', key: 'shorts_reels', category: 'content', description: 'Enable video shorts feature' },
            { name: 'Academic Services', key: 'academic_services', category: 'services', description: 'Show academic service category' },
            { name: 'Payment Gateway', key: 'payment_gateway', category: 'payments', description: 'Enable payment processing' },
            { name: 'Email Notifications', key: 'email_notifications', category: 'communication', description: 'Send email notifications' }
        ];

        for (const flag of flags) {
            await client.query(`
        INSERT INTO feature_flags (id, name, key, description, category, is_enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `, [uuidv4(), flag.name, flag.key, flag.description, flag.category]);
        }
        console.log('   ✅ Default feature flags seeded');

        // ========== 8. SEED DEFAULT PLATFORM CONFIG ==========
        console.log('8. Seeding default platform config...');
        const configs = [
            { key: 'platform_name', value: 'WENVEX', category: 'branding' },
            { key: 'platform_tagline', value: 'Global Tech Commerce Hub', category: 'branding' },
            { key: 'support_email', value: 'support@wenvex.online', category: 'contact' },
            { key: 'support_phone', value: '+91 7981994870', category: 'contact' },
            { key: 'min_service_price', value: '5', category: 'pricing' },
            { key: 'max_service_price', value: '100000', category: 'pricing' },
            { key: 'vendor_commission_rate', value: '10', category: 'pricing' }
        ];

        for (const config of configs) {
            await client.query(`
        INSERT INTO platform_config (id, key, value, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `, [uuidv4(), config.key, config.value, config.category]);
        }
        console.log('   ✅ Default platform config seeded');

        // ========== 9. SEED DEFAULT ROLE PERMISSIONS ==========
        console.log('9. Seeding default role permissions...');
        const permissions = [
            { role: 'SUPER_ADMIN', permission: 'manage_vendors' },
            { role: 'SUPER_ADMIN', permission: 'manage_services' },
            { role: 'SUPER_ADMIN', permission: 'manage_users' },
            { role: 'SUPER_ADMIN', permission: 'manage_categories' },
            { role: 'SUPER_ADMIN', permission: 'manage_settings' },
            { role: 'SUPER_ADMIN', permission: 'view_analytics' },
            { role: 'VENDOR', permission: 'manage_own_services' },
            { role: 'VENDOR', permission: 'manage_own_profile' },
            { role: 'BUYER', permission: 'view_services' },
            { role: 'BUYER', permission: 'submit_reviews' }
        ];

        for (const perm of permissions) {
            await client.query(`
        INSERT INTO role_permissions (id, role, permission, is_allowed, created_at, updated_at)
        VALUES ($1, $2, $3, true, NOW(), NOW())
        ON CONFLICT (role, permission) DO NOTHING;
      `, [uuidv4(), perm.role, perm.permission]);
        }
        console.log('   ✅ Default role permissions seeded');

        // ========== 10. GRANT PERMISSIONS ==========
        console.log('\n10. Granting permissions to new tables...');
        const newTables = ['feature_flags', 'platform_config', 'navigation', 'announcements', 'audit_log', 'role_permissions'];
        for (const table of newTables) {
            await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${table} TO anon, authenticated;`);
        }
        console.log('    ✅ Permissions granted');

        // ========== 11. RELOAD SCHEMA CACHE ==========
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('\n🚀 ADMIN PANEL FIX COMPLETE!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
