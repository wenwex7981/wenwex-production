
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const tables = ['vendors', 'services', 'categories', 'homepage_sections'];
        for (const table of tables) {
            const res = await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE relname = '${table}'`);
            console.log(`Table: ${table}, RLS Enabled: ${res.rows[0].relrowsecurity}`);
        }

        const perms = await client.query(`
      SELECT grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'vendors' AND grantee IN ('anon', 'authenticated');
    `);
        console.log('Permissions for vendors:');
        console.table(perms.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
