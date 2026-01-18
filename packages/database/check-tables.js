
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Checking all tables in database...\n');

        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        console.log('=== EXISTING TABLES ===');
        tables.rows.forEach(t => console.log('  -', t.table_name));

        // Check critical tables for vendor/admin dashboards
        const criticalTables = [
            'users', 'vendors', 'services', 'categories', 'subcategories',
            'homepage_sections', 'subscription_plans', 'subscriptions',
            'vendor_portfolio', 'vendor_photos', 'shorts', 'reviews',
            'admin_logs', 'site_settings', 'countries'
        ];

        console.log('\n=== CRITICAL TABLE STATUS ===');
        for (const table of criticalTables) {
            const exists = tables.rows.find(t => t.table_name === table);
            console.log(`  ${exists ? '✅' : '❌'} ${table}`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
