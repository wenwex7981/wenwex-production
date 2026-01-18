
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Synchronizing homepage section types with code (Upper Case)...');

        const mapping = {
            'categories': 'CATEGORIES',
            'featured_services': 'FEATURED_SERVICES',
            'top_agencies': 'TOP_AGENCIES',
            'trending': 'TRENDING_SERVICES',
            'academic_spotlight': 'ACADEMIC_SPOTLIGHT',
            'shorts_preview': 'SHORTS'
        };

        for (const [oldType, newType] of Object.entries(mapping)) {
            await client.query(`UPDATE homepage_sections SET type = $1 WHERE type = $2`, [newType, oldType]);
        }

        // Also check if Hero is missing
        const heroCheck = await client.query("SELECT id FROM homepage_sections WHERE type = 'HERO'");
        if (heroCheck.rowCount === 0) {
            await client.query(`
            INSERT INTO homepage_sections (id, type, title, "order", is_visible, config, created_at, updated_at)
            VALUES (gen_random_uuid(), 'HERO', 'Main Hero', 0, true, '{}', NOW(), NOW())
        `);
        }

        console.log('✅ Homepage sections updated.');

        // Reload cache
        await client.query("NOTIFY pgrst, 'reload schema';");

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
