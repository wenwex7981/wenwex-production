
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Creating missing tables and columns...\n');

        // 1. Create vendor_photos table (missing)
        console.log('Creating vendor_photos table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS vendor_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        "order" INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON vendor_photos(vendor_id);
    `);
        console.log('  ✅ vendor_photos created');

        // 2. Create site_settings table (missing)
        console.log('Creating site_settings table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
    `);
        console.log('  ✅ site_settings created');

        // 3. Add missing columns to vendors table
        console.log('Adding missing columns to vendors...');
        const vendorColumns = [
            { name: 'email', type: 'TEXT' },
            { name: 'phone_number', type: 'TEXT' },
            { name: 'response_time', type: 'TEXT' },
            { name: 'certifications', type: 'TEXT[]' },
            { name: 'documents', type: 'TEXT[]' }
        ];

        for (const col of vendorColumns) {
            try {
                await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
                console.log(`  ✅ Added vendors.${col.name}`);
            } catch (e) {
                console.log(`  ⚠️ vendors.${col.name} may already exist`);
            }
        }

        // 4. Seed default site settings
        console.log('Seeding default site settings...');
        const defaultSettings = [
            { key: 'site_name', value: 'WENVEX' },
            { key: 'site_tagline', value: 'Global Tech Commerce Hub' },
            { key: 'hero_title', value: 'Global Tech Commerce Hub.' },
            { key: 'hero_subtitle', value: "Empowering the world's most innovative companies through elite technology partnerships." },
            { key: 'contact_email', value: 'support@wenvex.online' },
            { key: 'contact_phone', value: '+91 7981994870' }
        ];

        for (const setting of defaultSettings) {
            await client.query(`
        INSERT INTO site_settings (id, key, value, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
        ON CONFLICT (key) DO NOTHING;
      `, [setting.key, setting.value]);
        }
        console.log('  ✅ Site settings seeded');

        // 5. Grant permissions to anon and authenticated roles
        console.log('Granting permissions...');
        const tables = ['vendor_photos', 'site_settings'];
        for (const table of tables) {
            await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${table} TO anon, authenticated;`);
        }
        console.log('  ✅ Permissions granted');

        // 6. Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('\n🚀 All missing tables and columns created!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
