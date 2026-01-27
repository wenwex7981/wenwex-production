
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Adding is_featured column to services table...');

        await client.query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
        `);

        console.log('✅ Added is_featured column');

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('🚀 Schema cache reloaded');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
