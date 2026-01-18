
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Seeding essential data for dashboards...\n');

        // 1. Check and create Super Admin user
        console.log('1. Creating Super Admin...');
        const adminCheck = await client.query("SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
        if (adminCheck.rowCount === 0) {
            await client.query(`
        INSERT INTO users (id, email, full_name, role, is_email_verified, created_at, updated_at)
        VALUES ($1, 'admin@wenvex.online', 'WENVEX Admin', 'SUPER_ADMIN', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN';
      `, [uuidv4()]);
            console.log('   ✅ Super Admin created');
        } else {
            console.log('   ✅ Super Admin already exists');
        }

        // 2. Check and create test vendor
        console.log('2. Creating Test Vendor...');
        const vendorCheck = await client.query("SELECT id FROM vendors WHERE slug = 'project-genie-tech-solutions' LIMIT 1");
        if (vendorCheck.rowCount === 0) {
            // First create vendor user
            const userId = uuidv4();
            await client.query(`
        INSERT INTO users (id, email, full_name, role, is_email_verified, created_at, updated_at)
        VALUES ($1, 'genie@wenvex.online', 'Project Genie', 'VENDOR', true, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `, [userId]);

            // Get the actual user ID
            const userRes = await client.query("SELECT id FROM users WHERE email = 'genie@wenvex.online'");
            const actualUserId = userRes.rows[0].id;

            // Create vendor
            await client.query(`
        INSERT INTO vendors (
          id, user_id, company_name, slug, official_email, phone, country,
          description, is_verified, status, created_at, updated_at
        ) VALUES (
          $1, $2, 'Project Genie Tech Solutions', 'project-genie-tech-solutions', 
          'genie@wenvex.online', '+91 7981994870', 'India',
          'Global Tech-Commerce Marketplace and Academic Hub.', true, 'APPROVED', NOW(), NOW()
        ) ON CONFLICT (slug) DO UPDATE SET status = 'APPROVED', is_verified = true;
      `, [uuidv4(), actualUserId]);
            console.log('   ✅ Test Vendor created and approved');
        } else {
            console.log('   ✅ Test Vendor already exists');
        }

        // 3. Ensure categories exist
        console.log('3. Checking categories...');
        const catCount = await client.query("SELECT COUNT(*) FROM categories");
        if (parseInt(catCount.rows[0].count) === 0) {
            const categories = [
                { name: 'Web Development', slug: 'web-development', type: 'IT_TECH' },
                { name: 'Mobile Apps', slug: 'mobile-apps', type: 'IT_TECH' },
                { name: 'AI & Data', slug: 'ai-data', type: 'IT_TECH' },
                { name: 'Cloud & DevOps', slug: 'cloud-devops', type: 'IT_TECH' },
                { name: 'Mini Projects', slug: 'mini-projects', type: 'ACADEMIC' },
                { name: 'Major Projects', slug: 'major-projects', type: 'ACADEMIC' }
            ];
            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                await client.query(`
          INSERT INTO categories (id, name, slug, type, "order", is_visible, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          ON CONFLICT DO NOTHING;
        `, [uuidv4(), cat.name, cat.slug, cat.type, i + 1]);
            }
            console.log('   ✅ Categories seeded');
        } else {
            console.log('   ✅ Categories already exist');
        }

        // 4. Ensure homepage sections use correct type format
        console.log('4. Fixing homepage section types...');
        const typeMapping = {
            'categories': 'CATEGORIES',
            'featured_services': 'FEATURED_SERVICES',
            'top_agencies': 'TOP_AGENCIES',
            'trending': 'TRENDING_SERVICES',
            'academic_spotlight': 'ACADEMIC_SPOTLIGHT',
            'shorts_preview': 'SHORTS'
        };
        for (const [oldType, newType] of Object.entries(typeMapping)) {
            await client.query("UPDATE homepage_sections SET type = $1 WHERE type = $2", [newType, oldType]);
        }

        // Add hero if missing
        const heroCheck = await client.query("SELECT id FROM homepage_sections WHERE type = 'HERO'");
        if (heroCheck.rowCount === 0) {
            await client.query(`
        INSERT INTO homepage_sections (id, type, title, "order", is_visible, config, created_at, updated_at)
        VALUES ($1, 'HERO', 'Main Hero', 0, true, '{}', NOW(), NOW())
      `, [uuidv4()]);
        }
        console.log('   ✅ Homepage sections fixed');

        // 5. Ensure subscription plans exist
        console.log('5. Checking subscription plans...');
        const planCount = await client.query("SELECT COUNT(*) FROM subscription_plans");
        if (parseInt(planCount.rows[0].count) === 0) {
            const plans = [
                { name: 'Starter', slug: 'starter', price: 1580.80, limit: 5, popular: false },
                { name: 'Professional', slug: 'professional', price: 4076.80, limit: 25, popular: true },
                { name: 'Enterprise', slug: 'enterprise', price: 8236.80, limit: -1, popular: false }
            ];
            for (let i = 0; i < plans.length; i++) {
                const p = plans[i];
                await client.query(`
          INSERT INTO subscription_plans (id, name, slug, description, price, currency, billing_period, services_limit, is_popular, is_active, display_order, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, 'INR', 'monthly', $6, $7, true, $8, NOW(), NOW())
          ON CONFLICT (slug) DO NOTHING;
        `, [uuidv4(), p.name, p.slug, p.name + ' plan for vendors', p.price, p.limit, p.popular, i + 1]);
            }
            console.log('   ✅ Subscription plans seeded');
        } else {
            console.log('   ✅ Subscription plans already exist');
        }

        // Reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log('\n🚀 All dashboard data seeded successfully!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
