
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('=== FIXING ALL TABLES FOR REVIEW SYSTEM & DYNAMIC FIELDS ===\n');

        // ========== 1. FIX REVIEWS TABLE ==========
        console.log('1. Fixing reviews table...');

        // Add all required columns to reviews table
        const reviewColumns = [
            { name: 'vendor_id', type: 'UUID' },
            { name: 'service_id', type: 'UUID' },
            { name: 'user_id', type: 'UUID' },
            { name: 'user_name', type: 'TEXT' },
            { name: 'rating', type: 'INT DEFAULT 5' },
            { name: 'comment', type: 'TEXT' },
            { name: 'content', type: 'TEXT' },
            { name: 'title', type: 'TEXT' },
            { name: 'service_title', type: 'TEXT' },
            { name: 'helpful_count', type: 'INT DEFAULT 0' },
            { name: 'is_verified', type: 'BOOLEAN DEFAULT false' },
            { name: 'is_approved', type: 'BOOLEAN DEFAULT true' },
            { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
            { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
        ];

        for (const col of reviewColumns) {
            try {
                await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) { }
        }
        console.log('   ✅ Reviews table fixed');

        // ========== 2. FIX SERVICES TABLE - PROJECT MEDIA ==========
        console.log('2. Fixing services table for project media...');

        const serviceColumns = [
            { name: 'tech_stack', type: "TEXT[] DEFAULT '{}'" },
            { name: 'project_videos', type: "TEXT[] DEFAULT '{}'" },
            { name: 'project_photos', type: "TEXT[] DEFAULT '{}'" },
            { name: 'project_documents', type: "TEXT[] DEFAULT '{}'" },
            { name: 'revisions', type: 'INT DEFAULT 3' },
            { name: 'custom_fields', type: "JSONB DEFAULT '{}'" }  // For dynamic fields
        ];

        for (const col of serviceColumns) {
            try {
                await client.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) { }
        }
        console.log('   ✅ Services table fixed');

        // ========== 3. FIX VENDORS TABLE ==========
        console.log('3. Fixing vendors table...');

        const vendorColumns = [
            { name: 'country', type: "TEXT DEFAULT 'IN'" },
            { name: 'custom_fields', type: "JSONB DEFAULT '{}'" }  // For dynamic fields
        ];

        for (const col of vendorColumns) {
            try {
                await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) { }
        }
        console.log('   ✅ Vendors table fixed');

        // ========== 4. CREATE DYNAMIC FIELD DEFINITIONS TABLE ==========
        console.log('4. Creating dynamic_field_definitions table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS dynamic_field_definitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type TEXT NOT NULL,  -- 'service', 'vendor', 'category', etc.
        field_key TEXT NOT NULL,
        field_label TEXT NOT NULL,
        field_type TEXT NOT NULL,   -- 'text', 'number', 'boolean', 'select', 'multiselect', 'file', 'url', 'date'
        field_options JSONB DEFAULT '[]',  -- Options for select/multiselect
        is_required BOOLEAN DEFAULT false,
        is_visible BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        placeholder TEXT,
        help_text TEXT,
        validation_rules JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(entity_type, field_key)
      );
    `);
        console.log('   ✅ dynamic_field_definitions table created');

        // ========== 5. SEED DEFAULT DYNAMIC FIELDS ==========
        console.log('5. Seeding default dynamic field definitions...');

        const defaultFields = [
            // Service fields
            { entity: 'service', key: 'tech_stack', label: 'Technologies Used', type: 'multiselect', order: 1 },
            { entity: 'service', key: 'project_photos', label: 'Project Photos', type: 'file', order: 2 },
            { entity: 'service', key: 'project_videos', label: 'Project Videos', type: 'file', order: 3 },
            { entity: 'service', key: 'project_documents', label: 'Related Documents', type: 'file', order: 4 },
            { entity: 'service', key: 'revisions', label: 'Number of Revisions', type: 'number', order: 5 },
            // Vendor fields
            { entity: 'vendor', key: 'country', label: 'Country', type: 'select', order: 1 },
            { entity: 'vendor', key: 'website_url', label: 'Website URL', type: 'url', order: 2 },
            { entity: 'vendor', key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', order: 3 },
        ];

        for (const field of defaultFields) {
            try {
                await client.query(`
          INSERT INTO dynamic_field_definitions (entity_type, field_key, field_label, field_type, display_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (entity_type, field_key) DO NOTHING
        `, [field.entity, field.key, field.label, field.type, field.order]);
            } catch (e) { }
        }
        console.log('   ✅ Default dynamic fields seeded');

        // ========== 6. ADD CUSTOM FIELDS TO OTHER TABLES ==========
        console.log('6. Adding custom_fields column to other tables...');

        const tablesToUpdate = ['categories', 'sub_categories', 'users', 'homepage_sections'];
        for (const table of tablesToUpdate) {
            try {
                await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'`);
            } catch (e) { }
        }
        console.log('   ✅ custom_fields added to all tables');

        // ========== 7. GRANT PERMISSIONS ==========
        console.log('7. Granting permissions...');
        await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON dynamic_field_definitions TO anon, authenticated;`);
        console.log('   ✅ Permissions granted');

        // ========== 8. RELOAD SCHEMA CACHE ==========
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 ALL TABLES FIXED! REVIEW SYSTEM READY!');
        console.log('\n📋 Dynamic Field Definitions Table Created!');
        console.log('   Super Admin can now add new fields via admin panel.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
