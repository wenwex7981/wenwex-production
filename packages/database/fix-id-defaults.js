
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Fixing ID column defaults for all tables...\n');

        // Tables that need UUID default
        const tables = [
            'users',
            'vendors',
            'services',
            'categories',
            'sub_categories',
            'homepage_sections',
            'subscription_plans',
            'subscriptions',
            'vendor_portfolio',
            'vendor_photos',
            'shorts',
            'reviews',
            'admin_logs',
            'site_settings',
            'countries',
            'follows',
            'saved_services',
            'service_media',
            'chat_conversations',
            'chat_messages',
            'subscription_pricing'
        ];

        for (const table of tables) {
            try {
                // Set default value for id column to auto-generate UUID
                await client.query(`
          ALTER TABLE "${table}" 
          ALTER COLUMN id SET DEFAULT gen_random_uuid();
        `);
                console.log(`✅ Fixed ${table}.id default`);
            } catch (e) {
                console.log(`⚠️ ${table}: ${e.message.split('\n')[0]}`);
            }
        }

        // Also fix user_id on vendors - ensure it can accept values
        console.log('\nFixing vendor table constraints...');
        try {
            // Make sure official_email allows inserts
            await client.query(`
        ALTER TABLE vendors ALTER COLUMN official_email DROP NOT NULL;
      `);
            console.log('✅ Made official_email nullable');
        } catch (e) {
            console.log('⚠️ official_email already nullable or error:', e.message.split('\n')[0]);
        }

        try {
            await client.query(`
        ALTER TABLE vendors ALTER COLUMN phone DROP NOT NULL;
      `);
            console.log('✅ Made phone nullable');
        } catch (e) {
            console.log('⚠️ phone already nullable or error:', e.message.split('\n')[0]);
        }

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 All ID defaults fixed!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
