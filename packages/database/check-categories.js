
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== CHECKING CATEGORIES ===\n');
        const cats = await client.query('SELECT id, name, slug, type, is_visible FROM categories ORDER BY "order"');
        console.table(cats.rows);

        console.log('\n=== CHECKING SUB_CATEGORIES ===\n');
        const subs = await client.query('SELECT id, name, category_id FROM sub_categories');
        console.table(subs.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
