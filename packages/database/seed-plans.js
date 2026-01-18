
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    connectionString: "postgresql://postgres:7981%40Nithin@db.gnhifwvbugtigbwjnfak.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('Seeding subscription plans...');

        const plans = [
            {
                id: uuidv4(),
                name: 'Starter',
                slug: 'starter',
                description: 'Perfect for individuals and small startups',
                price: 1580.80,
                currency: 'INR',
                billing_period: 'monthly',
                services_limit: 5,
                features: ['Up to 5 services', 'Standard visibility', 'Email support', 'Basic analytics'],
                is_popular: false,
                badge_text: null,
                badge_color: null,
                display_order: 1
            },
            {
                id: uuidv4(),
                name: 'Professional',
                slug: 'professional',
                description: 'Best for growing agencies',
                price: 4076.80,
                currency: 'INR',
                billing_period: 'monthly',
                services_limit: 25,
                features: ['Up to 25 services', 'Priority visibility', 'Priority support', 'Advanced analytics', 'Verified badge'],
                is_popular: true,
                badge_text: 'Popular',
                badge_color: 'yellow',
                display_order: 2
            },
            {
                id: uuidv4(),
                name: 'Enterprise',
                slug: 'enterprise',
                description: 'For large agencies with unlimited needs',
                price: 8236.80,
                currency: 'INR',
                billing_period: 'monthly',
                services_limit: -1,
                features: ['Unlimited services', 'Maximum visibility', '24/7 Dedicated support', 'Premium analytics', 'Custom branding'],
                is_popular: false,
                badge_text: 'Best Value',
                badge_color: 'green',
                display_order: 3
            }
        ];

        for (const plan of plans) {
            await client.query(`
        INSERT INTO subscription_plans (
          id, name, slug, description, price, currency, billing_period, 
          services_limit, features, is_popular, badge_text, badge_color, 
          is_active, display_order, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, NOW(), NOW()
        ) ON CONFLICT (slug) DO UPDATE SET 
          price = EXCLUDED.price,
          features = EXCLUDED.features,
          is_active = true;
      `, [
                plan.id, plan.name, plan.slug, plan.description, plan.price,
                plan.currency, plan.billing_period, plan.services_limit,
                plan.features, plan.is_popular, plan.badge_text, plan.badge_color,
                plan.display_order
            ]);
        }

        console.log('✅ Subscription plans seeded!');

        // Refresh cache
        await client.query("NOTIFY pgrst, 'reload schema';");

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
