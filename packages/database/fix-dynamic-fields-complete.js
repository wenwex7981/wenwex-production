
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FIXING DYNAMIC FIELDS TABLE - COMPLETE REBUILD ===\n');

        // 1. Drop and recreate with correct structure
        console.log('1. Dropping existing table if exists...');
        await client.query(`DROP TABLE IF EXISTS dynamic_field_definitions CASCADE;`);
        await client.query(`DROP TABLE IF EXISTS custom_fields CASCADE;`);
        console.log('   ✅ Dropped');

        // 2. Create with exact structure for the existing UI
        console.log('2. Creating dynamic_field_definitions table...');
        await client.query(`
      CREATE TABLE dynamic_field_definitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type TEXT NOT NULL DEFAULT 'service',
        field_key TEXT NOT NULL,
        field_label TEXT NOT NULL,
        field_name TEXT,
        display_label TEXT,
        field_type TEXT NOT NULL DEFAULT 'text',
        field_options JSONB DEFAULT '[]',
        section TEXT DEFAULT 'general',
        placeholder TEXT DEFAULT '',
        default_value TEXT DEFAULT '',
        help_text TEXT DEFAULT '',
        is_required BOOLEAN DEFAULT false,
        is_visible BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        validation_rules JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ Table created');

        // 3. Create indexes
        console.log('3. Creating indexes...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_dfd_entity ON dynamic_field_definitions(entity_type);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_dfd_key ON dynamic_field_definitions(field_key);`);
        console.log('   ✅ Indexes created');

        // 4. Enable RLS but allow all operations
        console.log('4. Setting up RLS policies...');
        await client.query(`ALTER TABLE dynamic_field_definitions ENABLE ROW LEVEL SECURITY;`);

        // Drop existing policies if any
        try {
            await client.query(`DROP POLICY IF EXISTS "Allow all read" ON dynamic_field_definitions;`);
            await client.query(`DROP POLICY IF EXISTS "Allow all insert" ON dynamic_field_definitions;`);
            await client.query(`DROP POLICY IF EXISTS "Allow all update" ON dynamic_field_definitions;`);
            await client.query(`DROP POLICY IF EXISTS "Allow all delete" ON dynamic_field_definitions;`);
        } catch (e) { }

        // Create permissive policies
        await client.query(`CREATE POLICY "Allow all read" ON dynamic_field_definitions FOR SELECT USING (true);`);
        await client.query(`CREATE POLICY "Allow all insert" ON dynamic_field_definitions FOR INSERT WITH CHECK (true);`);
        await client.query(`CREATE POLICY "Allow all update" ON dynamic_field_definitions FOR UPDATE USING (true);`);
        await client.query(`CREATE POLICY "Allow all delete" ON dynamic_field_definitions FOR DELETE USING (true);`);
        console.log('   ✅ RLS policies created');

        // 5. Grant permissions
        console.log('5. Granting permissions...');
        await client.query(`GRANT ALL ON dynamic_field_definitions TO anon;`);
        await client.query(`GRANT ALL ON dynamic_field_definitions TO authenticated;`);
        await client.query(`GRANT ALL ON dynamic_field_definitions TO service_role;`);
        console.log('   ✅ Permissions granted');

        // 6. Seed default fields
        console.log('6. Seeding default fields...');
        const defaultFields = [
            // Service fields
            { entity: 'service', key: 'tech_stack', label: 'Technologies Used', type: 'multiselect', section: 'details', order: 1 },
            { entity: 'service', key: 'project_photos', label: 'Project Photos', type: 'file', section: 'media', order: 2 },
            { entity: 'service', key: 'project_videos', label: 'Project Videos', type: 'file', section: 'media', order: 3 },
            { entity: 'service', key: 'project_documents', label: 'Project Documents', type: 'file', section: 'media', order: 4 },
            { entity: 'service', key: 'revisions', label: 'Number of Revisions', type: 'number', section: 'pricing', order: 5 },
            // Vendor fields
            { entity: 'vendor', key: 'country', label: 'Country', type: 'select', section: 'location', order: 1 },
            { entity: 'vendor', key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', section: 'contact', order: 2 },
            { entity: 'vendor', key: 'founded_year', label: 'Founded Year', type: 'number', section: 'about', order: 3 },
        ];

        for (const field of defaultFields) {
            await client.query(`
        INSERT INTO dynamic_field_definitions 
        (entity_type, field_key, field_label, field_name, display_label, field_type, section, display_order, is_visible)
        VALUES ($1, $2, $3, $2, $3, $4, $5, $6, true)
      `, [field.entity, field.key, field.label, field.type, field.section, field.order]);
        }
        console.log('   ✅ Default fields seeded');

        // 7. Verify
        console.log('\n7. Verifying table...');
        const result = await client.query(`SELECT COUNT(*) as count FROM dynamic_field_definitions;`);
        console.log(`   Total fields: ${result.rows[0].count}`);

        // 8. Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('   ✅ Schema cache reloaded');

        console.log('\n🚀 DYNAMIC FIELDS TABLE FIXED AND READY!');
        console.log('\nYou can now add, edit, and delete custom fields via Admin Panel.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
