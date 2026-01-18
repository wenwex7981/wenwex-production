
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== ADDING NEW FIELDS FOR SERVICES ===\n');

        // 1. Add tech_stack column to services
        console.log('1. Adding tech_stack column to services...');
        try {
            await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}'`);
            console.log('   ✅ tech_stack column added');
        } catch (e) { console.log('   Already exists'); }

        // 2. Add project_videos column
        console.log('2. Adding project_videos column to services...');
        try {
            await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS project_videos TEXT[] DEFAULT '{}'`);
            console.log('   ✅ project_videos column added');
        } catch (e) { console.log('   Already exists'); }

        // 3. Add project_photos column
        console.log('3. Adding project_photos column to services...');
        try {
            await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS project_photos TEXT[] DEFAULT '{}'`);
            console.log('   ✅ project_photos column added');
        } catch (e) { console.log('   Already exists'); }

        // 4. Add project_documents column
        console.log('4. Adding project_documents column to services...');
        try {
            await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS project_documents TEXT[] DEFAULT '{}'`);
            console.log('   ✅ project_documents column added');
        } catch (e) { console.log('   Already exists'); }

        // 5. Add revisions column
        console.log('5. Adding revisions column to services...');
        try {
            await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS revisions INT DEFAULT 3`);
            console.log('   ✅ revisions column added');
        } catch (e) { console.log('   Already exists'); }

        // 6. Ensure vendors have country column
        console.log('6. Checking vendors country column...');
        try {
            await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IN'`);
            console.log('   ✅ country column ensured');
        } catch (e) { console.log('   Already exists'); }

        // 7. Ensure reviews table has user_name
        console.log('7. Adding user_name to reviews...');
        try {
            await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT`);
            await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID`);
            await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_title TEXT`);
            await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0`);
            console.log('   ✅ Review columns added');
        } catch (e) { console.log('   Already exists'); }

        // 8. Reload cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 NEW FIELDS ADDED SUCCESSFULLY!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
