
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== CREATING DYNAMIC_FIELDS TABLE (EXACT MATCH FOR ADMIN UI) ===\n');

        // 1. Drop existing and create with exact structure matching admin UI
        console.log('1. Creating dynamic_fields table...');
        await client.query(`DROP TABLE IF EXISTS dynamic_fields CASCADE;`);

        await client.query(`
      CREATE TABLE dynamic_fields (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type TEXT NOT NULL DEFAULT 'vendors',
        field_name TEXT NOT NULL,
        field_label TEXT NOT NULL,
        field_type TEXT NOT NULL DEFAULT 'text',
        field_options JSONB DEFAULT '{"options": []}',
        placeholder TEXT DEFAULT '',
        default_value TEXT DEFAULT '',
        is_required BOOLEAN DEFAULT false,
        is_visible BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        section TEXT DEFAULT 'general',
        validation_rules JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('   ✅ Table created');

        // 2. Create unique constraint
        console.log('2. Creating constraints...');
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_df_unique ON dynamic_fields(entity_type, field_name);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_df_entity ON dynamic_fields(entity_type);`);
        console.log('   ✅ Constraints created');

        // 3. Enable RLS with permissive policies
        console.log('3. Setting up RLS policies...');
        await client.query(`ALTER TABLE dynamic_fields ENABLE ROW LEVEL SECURITY;`);

        await client.query(`CREATE POLICY "public_read" ON dynamic_fields FOR SELECT USING (true);`);
        await client.query(`CREATE POLICY "public_insert" ON dynamic_fields FOR INSERT WITH CHECK (true);`);
        await client.query(`CREATE POLICY "public_update" ON dynamic_fields FOR UPDATE USING (true);`);
        await client.query(`CREATE POLICY "public_delete" ON dynamic_fields FOR DELETE USING (true);`);
        console.log('   ✅ RLS policies created');

        // 4. Grant all permissions
        console.log('4. Granting permissions...');
        await client.query(`GRANT ALL ON dynamic_fields TO anon;`);
        await client.query(`GRANT ALL ON dynamic_fields TO authenticated;`);
        await client.query(`GRANT ALL ON dynamic_fields TO service_role;`);
        console.log('   ✅ Permissions granted');

        // 5. Seed some default fields
        console.log('5. Seeding default fields...');
        const defaultFields = [
            // Vendor fields
            { entity: 'vendors', name: 'company_tagline', label: 'Company Tagline', type: 'text', section: 'general', order: 1 },
            { entity: 'vendors', name: 'founded_year', label: 'Founded Year', type: 'number', section: 'general', order: 2 },
            { entity: 'vendors', name: 'team_size', label: 'Team Size', type: 'text', section: 'general', order: 3 },
            { entity: 'vendors', name: 'country', label: 'Country', type: 'select', section: 'contact', order: 4 },
            // Service fields
            { entity: 'services', name: 'tech_stack', label: 'Technologies Used', type: 'text', section: 'features', order: 1 },
            { entity: 'services', name: 'project_timeline', label: 'Project Timeline', type: 'text', section: 'general', order: 2 },
            { entity: 'services', name: 'revisions_included', label: 'Revisions Included', type: 'number', section: 'pricing', order: 3 },
        ];

        for (const field of defaultFields) {
            await client.query(`
        INSERT INTO dynamic_fields 
        (entity_type, field_name, field_label, field_type, section, display_order, is_visible, is_required)
        VALUES ($1, $2, $3, $4, $5, $6, true, false)
        ON CONFLICT (entity_type, field_name) DO NOTHING
      `, [field.entity, field.name, field.label, field.type, field.section, field.order]);
        }
        console.log('   ✅ Default fields seeded');

        // 6. Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('\n   ✅ Schema cache reloaded');

        // 7. Verify
        const result = await client.query(`SELECT COUNT(*) as count FROM dynamic_fields;`);
        console.log(`\n📊 Total fields in database: ${result.rows[0].count}`);

        console.log('\n🚀 DYNAMIC_FIELDS TABLE READY!');
        console.log('   Refresh the Admin Panel and try again.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
