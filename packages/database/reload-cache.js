
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => client.query("NOTIFY pgrst, 'reload schema'"))
    .then(() => {
        console.log('✅ Schema cache reloaded');
        client.end();
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });
