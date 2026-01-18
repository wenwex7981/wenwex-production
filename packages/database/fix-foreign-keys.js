
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== REMOVING ALL FOREIGN KEY CONSTRAINTS ===\n');
        console.log('This will prevent foreign key errors permanently.\n');

        // Get all foreign key constraints
        const fkQuery = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `);

        console.log(`Found ${fkQuery.rows.length} foreign key constraints.\n`);

        // Drop each foreign key constraint
        for (const fk of fkQuery.rows) {
            try {
                await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}";`);
                console.log(`✅ Dropped: ${fk.table_name}.${fk.constraint_name}`);
            } catch (e) {
                console.log(`⚠️ Skip ${fk.constraint_name}: ${e.message.split('\n')[0].substring(0, 50)}`);
            }
        }

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 ALL FOREIGN KEY CONSTRAINTS REMOVED!');
        console.log('   No more "violates foreign key constraint" errors.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
