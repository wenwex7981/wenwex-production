const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('🔌 Connected directly to DB');

        const sqlPath = path.join(__dirname, 'final-polish.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('✨ Applying final polish (triggers/RPCs)...');
        await client.query(sql);
        console.log('✅ Polished successfully!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
