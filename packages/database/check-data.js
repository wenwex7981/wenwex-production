
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- VENDORS ---');
        const vendors = await client.query('SELECT company_name, slug, status, is_verified FROM vendors');
        console.table(vendors.rows);

        console.log('--- SERVICES ---');
        const services = await client.query('SELECT title, status, is_featured FROM services');
        console.table(services.rows);

        console.log('--- HOMEPAGE SECTIONS ---');
        const sections = await client.query('SELECT title, type, is_visible FROM homepage_sections');
        console.table(sections.rows);

        console.log('--- CATEGORIES ---');
        const categories = await client.query('SELECT name, is_visible FROM categories');
        console.table(categories.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
