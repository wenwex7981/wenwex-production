
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║           WENVEX LAUNCH READINESS AUDIT                        ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        const issues = [];
        const warnings = [];
        const ready = [];

        // ========== 1. CHECK ALL REQUIRED TABLES ==========
        console.log('📋 1. CHECKING DATABASE TABLES...\n');

        const requiredTables = [
            'users', 'vendors', 'services', 'categories', 'sub_categories',
            'homepage_sections', 'subscription_plans', 'subscriptions',
            'vendor_portfolio', 'vendor_photos', 'shorts', 'reviews',
            'admin_logs', 'site_settings', 'follows', 'saved_services',
            'service_media', 'chat_conversations', 'chat_messages',
            'feature_flags', 'role_permissions', 'platform_config',
            'navigation_menus', 'announcements', 'admin_audit_log'
        ];

        const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
        const existingTables = tablesRes.rows.map(r => r.table_name);

        for (const table of requiredTables) {
            if (existingTables.includes(table)) {
                ready.push(`Table: ${table}`);
            } else {
                issues.push(`MISSING TABLE: ${table}`);
            }
        }

        // ========== 2. CHECK DATA COUNTS ==========
        console.log('📊 2. CHECKING DATA COUNTS...\n');

        const counts = {};
        const countTables = ['users', 'vendors', 'services', 'categories', 'homepage_sections',
            'subscription_plans', 'feature_flags', 'role_permissions', 'site_settings'];

        for (const table of countTables) {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
                counts[table] = parseInt(res.rows[0].count);
                if (counts[table] === 0) {
                    warnings.push(`NO DATA IN: ${table}`);
                }
            } catch (e) {
                issues.push(`ERROR COUNTING: ${table} - ${e.message}`);
            }
        }

        // ========== 3. CHECK SUPER ADMIN EXISTS ==========
        console.log('👤 3. CHECKING SUPER ADMIN...\n');

        const adminRes = await client.query("SELECT id, email FROM users WHERE role = 'SUPER_ADMIN' LIMIT 5");
        if (adminRes.rowCount === 0) {
            issues.push('NO SUPER ADMIN USER EXISTS');
        } else {
            ready.push(`Super Admin(s): ${adminRes.rows.map(a => a.email).join(', ')}`);
        }

        // ========== 4. CHECK APPROVED VENDORS ==========
        console.log('🏢 4. CHECKING APPROVED VENDORS...\n');

        const vendorRes = await client.query("SELECT COUNT(*) FROM vendors WHERE status = 'APPROVED'");
        if (parseInt(vendorRes.rows[0].count) === 0) {
            warnings.push('NO APPROVED VENDORS');
        } else {
            ready.push(`Approved Vendors: ${vendorRes.rows[0].count}`);
        }

        // ========== 5. CHECK ID DEFAULTS ==========
        console.log('🔑 5. CHECKING ID COLUMN DEFAULTS...\n');

        const idCheckTables = ['vendors', 'services', 'users', 'categories'];
        for (const table of idCheckTables) {
            try {
                const res = await client.query(`
          SELECT column_default FROM information_schema.columns 
          WHERE table_name = '${table}' AND column_name = 'id'
        `);
                if (!res.rows[0]?.column_default?.includes('uuid')) {
                    warnings.push(`${table}.id may not have UUID default`);
                }
            } catch (e) { }
        }

        // ========== 6. CHECK TIMESTAMP DEFAULTS ==========
        console.log('⏰ 6. CHECKING TIMESTAMP DEFAULTS...\n');

        for (const table of ['vendors', 'services', 'users']) {
            try {
                const res = await client.query(`
          SELECT column_default FROM information_schema.columns 
          WHERE table_name = '${table}' AND column_name = 'created_at'
        `);
                if (!res.rows[0]?.column_default) {
                    warnings.push(`${table}.created_at may not have NOW() default`);
                }
            } catch (e) { }
        }

        // ========== 7. CHECK PERMISSIONS ==========
        console.log('🔐 7. CHECKING TABLE PERMISSIONS...\n');

        const permRes = await client.query(`
      SELECT grantee, COUNT(*) as perms FROM information_schema.role_table_grants 
      WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
      GROUP BY grantee
    `);

        for (const row of permRes.rows) {
            if (parseInt(row.perms) < 50) {
                warnings.push(`${row.grantee} role may have limited permissions (${row.perms} grants)`);
            }
        }

        // ========== 8. CHECK HOMEPAGE SECTIONS ==========
        console.log('🏠 8. CHECKING HOMEPAGE SECTIONS...\n');

        const sectionsRes = await client.query("SELECT type FROM homepage_sections WHERE is_visible = true");
        const requiredSections = ['HERO', 'CATEGORIES', 'FEATURED_SERVICES'];
        for (const section of requiredSections) {
            if (!sectionsRes.rows.find(s => s.type === section)) {
                warnings.push(`MISSING HOMEPAGE SECTION: ${section}`);
            }
        }

        // ========== 9. CHECK STORAGE BUCKETS ==========
        console.log('📦 9. CHECKING STORAGE...\n');
        warnings.push('MANUAL CHECK NEEDED: Verify Supabase Storage buckets (services, vendors, onboarding)');

        // ========== 10. CHECK FEATURE FLAGS ==========
        console.log('🚩 10. CHECKING FEATURE FLAGS...\n');

        const flagsRes = await client.query("SELECT COUNT(*) FROM feature_flags WHERE is_enabled = true");
        ready.push(`Active Feature Flags: ${flagsRes.rows[0].count}`);

        // ========== PRINT RESULTS ==========
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                     AUDIT RESULTS                               ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        console.log('📊 DATA COUNTS:');
        for (const [table, count] of Object.entries(counts)) {
            console.log(`   ${table}: ${count}`);
        }

        console.log('\n✅ READY (' + ready.length + '):');
        ready.forEach(r => console.log(`   ✓ ${r}`));

        console.log('\n⚠️  WARNINGS (' + warnings.length + '):');
        warnings.forEach(w => console.log(`   ⚠ ${w}`));

        console.log('\n❌ CRITICAL ISSUES (' + issues.length + '):');
        if (issues.length === 0) {
            console.log('   None found!');
        } else {
            issues.forEach(i => console.log(`   ✗ ${i}`));
        }

        // ========== LAUNCH READINESS SCORE ==========
        const score = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5));
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log(`║  LAUNCH READINESS SCORE: ${score}%                                    ║`);
        console.log('╚════════════════════════════════════════════════════════════════╝');

        if (score >= 80) {
            console.log('\n🚀 WEBSITE IS LAUNCH READY!');
        } else if (score >= 50) {
            console.log('\n⚠️ WEBSITE NEEDS SOME FIXES BEFORE LAUNCH');
        } else {
            console.log('\n❌ WEBSITE NOT READY FOR LAUNCH');
        }

    } catch (err) {
        console.error('❌ Audit Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
