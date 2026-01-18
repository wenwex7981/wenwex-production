
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- CHAT CONVERSATIONS ---');
        const convs = await client.query('SELECT * FROM chat_conversations LIMIT 5');
        console.table(convs.rows);

        console.log('--- CHAT MESSAGES ---');
        const msgs = await client.query('SELECT * FROM chat_messages LIMIT 5');
        console.table(msgs.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
