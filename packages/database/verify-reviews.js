
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== VERIFYING REVIEWS TABLE STRUCTURE ===\n');

        const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position
    `);

        console.log('Reviews Table Columns:');
        console.log('-'.repeat(50));
        result.rows.forEach(row => {
            console.log(`  ${row.column_name.padEnd(20)} ${row.data_type.padEnd(25)} ${row.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
        });
        console.log('-'.repeat(50));
        console.log(`Total columns: ${result.rows.length}`);

        // Check if vendor_id exists
        const hasVendorId = result.rows.some(r => r.column_name === 'vendor_id');
        console.log(`\n✅ vendor_id column exists: ${hasVendorId}`);

        // Force reload schema cache again
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema cache reloaded');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
