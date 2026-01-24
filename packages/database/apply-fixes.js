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
        console.log('🔌 Connected to Database');

        const sqlPath = path.join(__dirname, 'final-fix-all.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing migration...');
        await client.query(sql);
        console.log('✅ Migration executed successfully!');

    } catch (err) {
        console.error('❌ Error executing migration:', err.message);
        if (err.position) {
            console.error('   At position:', err.position);
        }
    } finally {
        await client.end();
        console.log('🔌 Disconnected');
    }
}

run();
