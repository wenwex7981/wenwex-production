
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FINAL FIXES FOR LAUNCH READINESS ===\n');

        // Fix users table defaults
        console.log('1. Fixing users table defaults...');
        try {
            await client.query(`ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();`);
            await client.query(`ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();`);
            await client.query(`ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();`);
            console.log('   ✅ users table defaults fixed');
        } catch (e) { console.log('   ⚠️ Some columns may already have defaults'); }

        // Ensure all homepage sections have correct types
        console.log('2. Ensuring homepage sections have correct types...');
        const typeMapping = {
            'hero': 'HERO',
            'categories': 'CATEGORIES',
            'featured_services': 'FEATURED_SERVICES',
            'top_agencies': 'TOP_AGENCIES',
            'trending': 'TRENDING_SERVICES',
            'academic_spotlight': 'ACADEMIC_SPOTLIGHT',
            'shorts_preview': 'SHORTS',
            'cta': 'CTA',
            'promo_carousel': 'PROMO_CAROUSEL'
        };

        for (const [old, newType] of Object.entries(typeMapping)) {
            await client.query('UPDATE homepage_sections SET type = $1 WHERE LOWER(type) = $2', [newType, old]);
        }
        console.log('   ✅ Homepage section types normalized');

        // Ensure HERO section exists
        const heroCheck = await client.query("SELECT id FROM homepage_sections WHERE type = 'HERO'");
        if (heroCheck.rowCount === 0) {
            await client.query(`
        INSERT INTO homepage_sections (id, type, title, subtitle, "order", is_visible, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'HERO', 'Hero Section', 'Welcome to WENVEX', 0, true, '{}', NOW(), NOW())
      `);
            console.log('   ✅ HERO section created');
        }

        // Ensure CATEGORIES section exists
        const catCheck = await client.query("SELECT id FROM homepage_sections WHERE type = 'CATEGORIES'");
        if (catCheck.rowCount === 0) {
            await client.query(`
        INSERT INTO homepage_sections (id, type, title, subtitle, "order", is_visible, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'CATEGORIES', 'Browse by Category', 'Find the right service', 1, true, '{}', NOW(), NOW())
      `);
            console.log('   ✅ CATEGORIES section created');
        }

        // Ensure FEATURED_SERVICES section exists
        const featCheck = await client.query("SELECT id FROM homepage_sections WHERE type = 'FEATURED_SERVICES'");
        if (featCheck.rowCount === 0) {
            await client.query(`
        INSERT INTO homepage_sections (id, type, title, subtitle, "order", is_visible, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'FEATURED_SERVICES', 'Featured Services', 'Top picks from our vendors', 2, true, '{"limit": 8}', NOW(), NOW())
      `);
            console.log('   ✅ FEATURED_SERVICES section created');
        }

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 FINAL FIXES COMPLETE!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
