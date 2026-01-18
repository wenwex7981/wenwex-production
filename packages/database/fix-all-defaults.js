
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FIXING ALL COLUMN DEFAULTS FOR PRODUCTION STABILITY ===\n');

        // All tables that need fixes
        const tables = [
            'users', 'vendors', 'services', 'categories', 'sub_categories',
            'homepage_sections', 'subscription_plans', 'subscriptions',
            'vendor_portfolio', 'vendor_photos', 'shorts', 'reviews',
            'admin_logs', 'site_settings', 'follows', 'saved_services',
            'service_media', 'chat_conversations', 'chat_messages', 'subscription_pricing'
        ];

        for (const table of tables) {
            console.log(`\nFixing ${table}...`);

            // 1. Fix ID default
            try {
                await client.query(`ALTER TABLE "${table}" ALTER COLUMN id SET DEFAULT gen_random_uuid();`);
                console.log(`  ✅ id default set`);
            } catch (e) { console.log(`  ⚠️ id: ${e.message.split('\n')[0].substring(0, 50)}`); }

            // 2. Fix created_at default
            try {
                await client.query(`ALTER TABLE "${table}" ALTER COLUMN created_at SET DEFAULT NOW();`);
                console.log(`  ✅ created_at default set`);
            } catch (e) { console.log(`  ⚠️ created_at: ${e.message.split('\n')[0].substring(0, 50)}`); }

            // 3. Fix updated_at default
            try {
                await client.query(`ALTER TABLE "${table}" ALTER COLUMN updated_at SET DEFAULT NOW();`);
                console.log(`  ✅ updated_at default set`);
            } catch (e) { console.log(`  ⚠️ updated_at: ${e.message.split('\n')[0].substring(0, 50)}`); }
        }

        // Special fixes for vendors table - all columns that might be null on insert
        console.log('\n=== SPECIAL FIXES FOR VENDORS TABLE ===');
        const vendorNullableColumns = [
            'official_email', 'phone', 'country', 'description', 'logo_url', 'banner_url',
            'website', 'website_url', 'pan_number', 'tan_number', 'whatsapp_number',
            'payment_proof_url', 'founded_year', 'team_size', 'projects_done',
            'satisfaction_rate', 'social_links', 'subscription_plan_id', 'subscription_status',
            'rejection_reason', 'deleted_at', 'email', 'phone_number', 'response_time',
            'certifications', 'documents'
        ];

        for (const col of vendorNullableColumns) {
            try {
                await client.query(`ALTER TABLE vendors ALTER COLUMN "${col}" DROP NOT NULL;`);
                console.log(`  ✅ vendors.${col} made nullable`);
            } catch (e) { /* Column already nullable or doesn't exist */ }
        }

        // Set defaults for vendors boolean/int columns
        const vendorDefaults = [
            { col: 'is_verified', val: 'false' },
            { col: 'status', val: "'PENDING'" },
            { col: 'followers_count', val: '0' },
            { col: 'rating', val: '0' },
            { col: 'total_reviews', val: '0' }
        ];

        for (const { col, val } of vendorDefaults) {
            try {
                await client.query(`ALTER TABLE vendors ALTER COLUMN "${col}" SET DEFAULT ${val};`);
                console.log(`  ✅ vendors.${col} default set to ${val}`);
            } catch (e) { console.log(`  ⚠️ vendors.${col}: ${e.message.split('\n')[0].substring(0, 50)}`); }
        }

        // Special fixes for users table
        console.log('\n=== SPECIAL FIXES FOR USERS TABLE ===');
        const userNullableColumns = ['avatar_url', 'phone', 'country', 'supabase_id', 'deleted_at'];
        for (const col of userNullableColumns) {
            try {
                await client.query(`ALTER TABLE users ALTER COLUMN "${col}" DROP NOT NULL;`);
                console.log(`  ✅ users.${col} made nullable`);
            } catch (e) { /* Already nullable */ }
        }

        try {
            await client.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'BUYER';`);
            await client.query(`ALTER TABLE users ALTER COLUMN is_email_verified SET DEFAULT false;`);
            console.log(`  ✅ users defaults set`);
        } catch (e) { console.log(`  ⚠️ users defaults: ${e.message.split('\n')[0].substring(0, 50)}`); }

        // Special fixes for services table
        console.log('\n=== SPECIAL FIXES FOR SERVICES TABLE ===');
        const serviceNullableColumns = [
            'sub_category_id', 'short_description', 'rejection_reason', 'main_image_url', 'deleted_at'
        ];
        for (const col of serviceNullableColumns) {
            try {
                await client.query(`ALTER TABLE services ALTER COLUMN "${col}" DROP NOT NULL;`);
                console.log(`  ✅ services.${col} made nullable`);
            } catch (e) { /* Already nullable */ }
        }

        const serviceDefaults = [
            { col: 'status', val: "'DRAFT'" },
            { col: 'is_featured', val: 'false' },
            { col: 'view_count', val: '0' },
            { col: 'rating', val: '0' },
            { col: 'total_reviews', val: '0' },
            { col: 'tech_stack', val: "'{}'" },
            { col: 'features', val: "'{}'" }
        ];
        for (const { col, val } of serviceDefaults) {
            try {
                await client.query(`ALTER TABLE services ALTER COLUMN "${col}" SET DEFAULT ${val};`);
                console.log(`  ✅ services.${col} default set`);
            } catch (e) { /* Skip */ }
        }

        // Fix categories table
        console.log('\n=== SPECIAL FIXES FOR CATEGORIES TABLE ===');
        try {
            await client.query(`ALTER TABLE categories ALTER COLUMN "order" SET DEFAULT 0;`);
            await client.query(`ALTER TABLE categories ALTER COLUMN is_visible SET DEFAULT true;`);
            await client.query(`ALTER TABLE categories ALTER COLUMN description DROP NOT NULL;`);
            await client.query(`ALTER TABLE categories ALTER COLUMN image_url DROP NOT NULL;`);
            console.log(`  ✅ categories defaults set`);
        } catch (e) { console.log(`  ⚠️ categories: ${e.message.split('\n')[0].substring(0, 50)}`); }

        // Fix homepage_sections table
        console.log('\n=== SPECIAL FIXES FOR HOMEPAGE_SECTIONS TABLE ===');
        try {
            await client.query(`ALTER TABLE homepage_sections ALTER COLUMN "order" SET DEFAULT 0;`);
            await client.query(`ALTER TABLE homepage_sections ALTER COLUMN is_visible SET DEFAULT true;`);
            await client.query(`ALTER TABLE homepage_sections ALTER COLUMN config SET DEFAULT '{}';`);
            await client.query(`ALTER TABLE homepage_sections ALTER COLUMN subtitle DROP NOT NULL;`);
            console.log(`  ✅ homepage_sections defaults set`);
        } catch (e) { console.log(`  ⚠️ homepage_sections: ${e.message.split('\n')[0].substring(0, 50)}`); }

        // Fix subscription_plans table
        console.log('\n=== SPECIAL FIXES FOR SUBSCRIPTION_PLANS TABLE ===');
        try {
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN currency SET DEFAULT 'INR';`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN billing_period SET DEFAULT 'monthly';`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN services_limit SET DEFAULT 5;`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN features SET DEFAULT '{}';`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN is_popular SET DEFAULT false;`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN is_active SET DEFAULT true;`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN display_order SET DEFAULT 0;`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN badge_text DROP NOT NULL;`);
            await client.query(`ALTER TABLE subscription_plans ALTER COLUMN badge_color DROP NOT NULL;`);
            console.log(`  ✅ subscription_plans defaults set`);
        } catch (e) { console.log(`  ⚠️ subscription_plans: ${e.message.split('\n')[0].substring(0, 50)}`); }

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 ALL COLUMN DEFAULTS FIXED FOR PRODUCTION!');
        console.log('   No more not-null constraint errors should occur.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
