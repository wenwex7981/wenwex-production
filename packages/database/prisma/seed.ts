// ===========================================
// WENVEX DATABASE SEED SCRIPT
// ===========================================
// This script seeds the database with initial data including
// categories, subcategories, homepage sections, countries, and subscription pricing

import { PrismaClient, CategoryType, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // ==================== SEED COUNTRIES ====================
    console.log('📍 Seeding countries...');

    const countries = [
        { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', isEnabled: true },
        { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', isEnabled: true },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', isEnabled: true },
        { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', isEnabled: true },
        { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', isEnabled: true },
        { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', isEnabled: true },
        { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', isEnabled: true },
        { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', isEnabled: true },
        { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ', isEnabled: true },
        { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', isEnabled: true },
    ];

    for (const country of countries) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: country,
            create: country,
        });
    }
    console.log(`  ✅ Created ${countries.length} countries\n`);

    // ==================== SEED CATEGORIES ====================
    console.log('📂 Seeding categories...');

    // IT & Tech Category
    const itTechCategory = await prisma.category.upsert({
        where: { slug: 'it-tech-services' },
        update: {},
        create: {
            name: 'IT & Tech Services',
            slug: 'it-tech-services',
            description: 'Professional technology services from verified agencies worldwide. From web development to AI solutions.',
            type: CategoryType.IT_TECH,
            order: 1,
            isVisible: true,
        },
    });

    // Academic Category
    const academicCategory = await prisma.category.upsert({
        where: { slug: 'academic-services' },
        update: {},
        create: {
            name: 'Academic & Student Services',
            slug: 'academic-services',
            description: 'Academic assistance for students including projects, research papers, and exam preparation.',
            type: CategoryType.ACADEMIC,
            order: 2,
            isVisible: true,
        },
    });

    console.log('  ✅ Created main categories\n');

    // ==================== SEED IT & TECH SUBCATEGORIES ====================
    console.log('📁 Seeding IT & Tech subcategories...');

    const itSubcategories = [
        {
            name: 'Web Application Development',
            slug: 'web-application-development',
            description: 'Custom web applications, e-commerce platforms, SaaS solutions, and enterprise portals built with modern frameworks.',
            order: 1,
        },
        {
            name: 'Mobile App Development',
            slug: 'mobile-app-development',
            description: 'Native iOS and Android apps, cross-platform solutions using React Native and Flutter.',
            order: 2,
        },
        {
            name: 'Custom Software',
            slug: 'custom-software',
            description: 'Tailored software solutions designed to meet your specific business requirements.',
            order: 3,
        },
        {
            name: 'UI/UX & Product Design',
            slug: 'ui-ux-product-design',
            description: 'User interface design, UX research, prototyping, and design systems that delight users.',
            order: 4,
        },
        {
            name: 'Cloud & DevOps',
            slug: 'cloud-devops',
            description: 'Cloud infrastructure, CI/CD pipelines, Kubernetes, Docker, and serverless solutions.',
            order: 5,
        },
        {
            name: 'AI & Data Solutions',
            slug: 'ai-data-solutions',
            description: 'Machine learning models, data analytics, NLP, computer vision, and AI-powered applications.',
            order: 6,
        },
        {
            name: 'Cybersecurity',
            slug: 'cybersecurity',
            description: 'Security audits, penetration testing, compliance, and security infrastructure setup.',
            order: 7,
        },
        {
            name: 'QA & Testing',
            slug: 'qa-testing',
            description: 'Quality assurance, automated testing, performance testing, and test automation frameworks.',
            order: 8,
        },
        {
            name: 'Automation & Tools',
            slug: 'automation-tools',
            description: 'Business process automation, workflow tools, and custom integrations.',
            order: 9,
        },
    ];

    for (const sub of itSubcategories) {
        await prisma.subCategory.upsert({
            where: { slug: sub.slug },
            update: sub,
            create: {
                ...sub,
                categoryId: itTechCategory.id,
                isVisible: true,
            },
        });
    }
    console.log(`  ✅ Created ${itSubcategories.length} IT & Tech subcategories\n`);

    // ==================== SEED ACADEMIC SUBCATEGORIES ====================
    console.log('📁 Seeding Academic subcategories...');

    const academicSubcategories = [
        {
            name: 'Mini Projects',
            slug: 'mini-projects',
            description: 'Small-scale academic projects perfect for coursework, labs, and semester assignments.',
            order: 1,
        },
        {
            name: 'Major Projects',
            slug: 'major-projects',
            description: 'Final year projects, capstone projects, and comprehensive academic submissions.',
            order: 2,
        },
        {
            name: 'Research Papers',
            slug: 'research-papers',
            description: 'Research assistance, literature reviews, and academic paper writing support.',
            order: 3,
        },
        {
            name: 'Assignments',
            slug: 'assignments',
            description: 'Assignment help, homework assistance, and academic support across subjects.',
            order: 4,
        },
        {
            name: 'Exam Preparation',
            slug: 'exam-preparation',
            description: 'Exam prep materials, tutoring, study guides, and practice tests.',
            order: 5,
        },
        {
            name: 'Internship Assistance',
            slug: 'internship-assistance',
            description: 'Internship projects, career guidance, resume building, and interview preparation.',
            order: 6,
        },
    ];

    for (const sub of academicSubcategories) {
        await prisma.subCategory.upsert({
            where: { slug: sub.slug },
            update: sub,
            create: {
                ...sub,
                categoryId: academicCategory.id,
                isVisible: true,
            },
        });
    }
    console.log(`  ✅ Created ${academicSubcategories.length} Academic subcategories\n`);

    // ==================== SEED SUBSCRIPTION PRICING ====================
    console.log('💰 Seeding subscription pricing...');

    // India Pricing (INR)
    const indiaPricing = [
        { plan: SubscriptionPlan.STARTER, country: 'IN', currency: 'INR', monthlyPrice: 1499, yearlyPrice: 14990, features: ['Up to 5 services', '10 portfolio items', '5 shorts/month', 'Email support'] },
        { plan: SubscriptionPlan.PROFESSIONAL, country: 'IN', currency: 'INR', monthlyPrice: 2999, yearlyPrice: 29990, features: ['Up to 25 services', '50 portfolio items', '25 shorts/month', 'Priority support', 'Featured badge'] },
        { plan: SubscriptionPlan.ENTERPRISE, country: 'IN', currency: 'INR', monthlyPrice: 4999, yearlyPrice: 49990, features: ['Unlimited services', 'Unlimited portfolio', 'Unlimited shorts', 'Dedicated manager', 'Custom branding'] },
    ];

    // Global Pricing (USD) - applies to all other countries
    const globalPricing = [
        { plan: SubscriptionPlan.STARTER, country: 'US', currency: 'USD', monthlyPrice: 19, yearlyPrice: 190, features: ['Up to 5 services', '10 portfolio items', '5 shorts/month', 'Email support'] },
        { plan: SubscriptionPlan.PROFESSIONAL, country: 'US', currency: 'USD', monthlyPrice: 49, yearlyPrice: 490, features: ['Up to 25 services', '50 portfolio items', '25 shorts/month', 'Priority support', 'Featured badge'] },
        { plan: SubscriptionPlan.ENTERPRISE, country: 'US', currency: 'USD', monthlyPrice: 99, yearlyPrice: 990, features: ['Unlimited services', 'Unlimited portfolio', 'Unlimited shorts', 'Dedicated manager', 'Custom branding'] },
    ];

    for (const pricing of [...indiaPricing, ...globalPricing]) {
        await prisma.subscriptionPricing.upsert({
            where: {
                plan_country: { plan: pricing.plan, country: pricing.country }
            },
            update: pricing,
            create: {
                ...pricing,
                isActive: true,
            },
        });
    }
    console.log(`  ✅ Created subscription pricing for India and Global markets\n`);

    // ==================== SEED HOMEPAGE SECTIONS ====================
    console.log('🏠 Seeding homepage sections...');

    const homepageSections = [
        {
            type: 'categories',
            title: 'Browse by Category',
            subtitle: 'Find the perfect service for your needs',
            order: 1,
            isVisible: true,
            config: {},
        },
        {
            type: 'featured_services',
            title: 'Featured Services',
            subtitle: 'Hand-picked services from top agencies',
            order: 2,
            isVisible: true,
            config: { limit: 8 },
        },
        {
            type: 'top_agencies',
            title: 'Top Agencies',
            subtitle: 'Trusted vendors with proven track records',
            order: 3,
            isVisible: true,
            config: { limit: 6 },
        },
        {
            type: 'trending',
            title: 'Trending Services',
            subtitle: 'Most popular services right now',
            order: 4,
            isVisible: true,
            config: { limit: 8 },
        },
        {
            type: 'academic_spotlight',
            title: 'Academic Services Spotlight',
            subtitle: 'Top-rated help for students',
            order: 5,
            isVisible: true,
            config: { limit: 6 },
        },
        {
            type: 'shorts_preview',
            title: 'Discover Shorts',
            subtitle: 'Quick previews of amazing services',
            order: 6,
            isVisible: true,
            config: { limit: 4 },
        },
    ];

    for (const section of homepageSections) {
        await prisma.homepageSection.upsert({
            where: { id: section.type }, // Using type as a pseudo-unique identifier
            update: section,
            create: section,
        });
    }
    console.log(`  ✅ Created ${homepageSections.length} homepage sections\n`);

    // ==================== CREATE SUPER ADMIN ====================
    console.log('👨‍💼 Creating Super Admin user...');

    await prisma.user.upsert({
        where: { email: 'admin@wenvex.online' },
        update: {},
        create: {
            email: 'admin@wenvex.online',
            fullName: 'WENVEX Admin',
            role: 'SUPER_ADMIN',
            isEmailVerified: true,
        },
    });
    console.log('  ✅ Super Admin created (email: admin@wenvex.online)\n');

    console.log('✨ Database seed completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
