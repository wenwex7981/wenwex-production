// ==========================================
// Page Contents Table Migration
// ==========================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPageContentsTable() {
    console.log('🚀 Creating page_contents table...');

    // Create page_contents table using raw SQL
    const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
            CREATE TABLE IF NOT EXISTS page_contents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                page_slug VARCHAR(100) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT,
                content JSONB NOT NULL DEFAULT '{}',
                meta_title VARCHAR(255),
                meta_desc TEXT,
                is_published BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_page_contents_slug ON page_contents(page_slug);
            CREATE INDEX IF NOT EXISTS idx_page_contents_published ON page_contents(is_published);
        `
    });

    if (tableError) {
        console.log('⚠️ RPC exec_sql not available, trying direct approach...');

        // Try inserting a test row to check if table exists
        const { data, error: checkError } = await supabase
            .from('page_contents')
            .select('id')
            .limit(1);

        if (checkError && checkError.code === '42P01') {
            console.log('❌ Table does not exist. Please create it manually in Supabase dashboard:');
            console.log(`
CREATE TABLE page_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    meta_title VARCHAR(255),
    meta_desc TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_contents_slug ON page_contents(page_slug);
CREATE INDEX idx_page_contents_published ON page_contents(is_published);
            `);
        } else if (!checkError) {
            console.log('✅ Table already exists!');
        }
    } else {
        console.log('✅ Table created successfully!');
    }
}

async function seedDefaultPageContent() {
    console.log('📝 Seeding default page content...');

    const aboutContent = {
        hero: {
            badge: 'ABOUT WENWEX',
            title: 'Empowering the Future of',
            titleHighlight: 'Global Tech Commerce',
            description: 'WENWEX is the premier global marketplace where verified technology agencies and service providers offer enterprise solutions as structured products. We connect businesses worldwide with top-tier tech talent for web development, mobile apps, AI solutions, cloud services, and digital transformation.'
        },
        stats: [
            { value: '10K+', label: 'Active Users', icon: 'Users' },
            { value: '500+', label: 'Verified Agencies', icon: 'Building2' },
            { value: '25+', label: 'Countries', icon: 'Globe2' },
            { value: '98%', label: 'Client Satisfaction', icon: 'Star' }
        ],
        mission: {
            badge: 'Our Mission',
            title: 'Democratizing Access to World-Class Technology Solutions',
            description1: 'We believe every business deserves access to enterprise-grade technology solutions. WENWEX bridges the gap between visionary companies and exceptional tech talent across the globe.',
            description2: 'From Fortune 500 enterprises to ambitious startups, we curate the best technology professionals and make premium services accessible to organizations worldwide.',
            services: ['Enterprise Web Development', 'Mobile App Solutions', 'AI & Machine Learning', 'Cloud Infrastructure', 'Digital Transformation', 'Custom Software']
        },
        quote: {
            text: '"We don\'t just connect businesses with vendors – we curate global tech excellence."',
            author: 'WENWEX Leadership',
            role: 'Pioneering the Future of Tech Commerce'
        },
        values: [
            {
                icon: 'Shield',
                title: 'Trust & Security',
                description: 'Every vendor undergoes rigorous verification. Enterprise-grade security protects your data and transactions.',
                gradient: 'from-blue-500 to-cyan-500'
            },
            {
                icon: 'Sparkles',
                title: 'Excellence First',
                description: 'We maintain the highest industry standards. Only verified professionals with proven enterprise track records.',
                gradient: 'from-purple-500 to-pink-500'
            },
            {
                icon: 'Zap',
                title: 'Innovation',
                description: 'Cutting-edge technology powers our marketplace, ensuring seamless global commerce experiences.',
                gradient: 'from-amber-500 to-orange-500'
            },
            {
                icon: 'Globe2',
                title: 'Global Reach',
                description: 'Connect with verified technology providers across 25+ countries for truly global solutions.',
                gradient: 'from-green-500 to-emerald-500'
            }
        ],
        milestones: [
            { year: '2025', title: 'Founded', description: 'WENWEX was established with a vision to revolutionize global tech commerce' },
            { year: '2025', title: 'Platform Launch', description: 'Full marketplace launch connecting businesses with verified tech agencies worldwide' },
            { year: '2026', title: 'Global Expansion', description: 'Expanding to 25+ countries with enterprise-grade agency network' },
            { year: 'Future', title: 'Your Success', description: 'Continuously evolving to power your digital transformation' }
        ],
        team: {
            badge: 'Our Team',
            title: 'World-Class Professionals Building',
            titleHighlight: 'Global Solutions',
            description: 'Behind WENWEX is a diverse team of technology veterans, enterprise architects, and industry experts committed to delivering excellence. We\'re united by our passion for technology and dedication to client success.',
            highlights: ['Enterprise Technology Experts', 'Global Support Team 24/7', 'Quality Assurance Specialists', 'Industry Veterans & Advisors'],
            company: 'Project Genie Tech Solutions',
            companyRole: 'Enterprise Technology'
        },
        cta: {
            title: 'Ready to Transform Your Business?',
            description: 'Join thousands of forward-thinking companies leveraging WENWEX for their technology needs.',
            primaryBtn: 'Explore Services',
            primaryLink: '/services',
            secondaryBtn: 'Contact Us',
            secondaryLink: '/contact'
        }
    };

    const contactContent = {
        hero: {
            badge: 'Contact Us',
            title: 'Let\'s Start a',
            titleHighlight: 'Conversation',
            description: 'Have questions, need a custom solution, or want to partner with us? Our global team is ready to help you achieve your technology goals.'
        },
        contactMethods: [
            {
                icon: 'Mail',
                title: 'Email Us',
                description: 'Enterprise response within 24 hours',
                value: 'wenvex19@gmail.com',
                href: 'mailto:wenvex19@gmail.com',
                gradient: 'from-blue-500 to-cyan-500'
            },
            {
                icon: 'Phone',
                title: 'Call Us',
                description: 'Mon-Sat from 9am to 6pm IST',
                value: '+91 7981994870',
                href: 'tel:+917981994870',
                gradient: 'from-green-500 to-emerald-500'
            },
            {
                icon: 'MapPin',
                title: 'Headquarters',
                description: 'T-Hub, Hyderabad',
                value: 'Hyderabad, India',
                href: '#location',
                gradient: 'from-purple-500 to-pink-500'
            },
            {
                icon: 'Clock',
                title: 'Business Hours',
                description: 'Global support available',
                value: 'Mon - Sat, 9AM - 6PM IST',
                href: '#',
                gradient: 'from-amber-500 to-orange-500'
            }
        ],
        inquiryTypes: [
            { id: 'general', label: 'General Inquiry', icon: 'MessageSquare' },
            { id: 'enterprise', label: 'Enterprise Solutions', icon: 'Building2' },
            { id: 'support', label: 'Technical Support', icon: 'Headphones' },
            { id: 'partnership', label: 'Partnership', icon: 'Briefcase' },
            { id: 'vendor', label: 'Become a Vendor', icon: 'Users' }
        ],
        company: {
            name: 'WENWEX',
            tagline: 'Global Tech Commerce Platform',
            parent: 'Project Genie Tech Solutions',
            website: 'www.wenwex.online',
            email: 'wenvex19@gmail.com',
            phone: '+91 7981994870'
        },
        location: {
            title: 'Our Headquarters',
            address: 'T-Hub, IIIT Hyderabad Campus, Gachibowli',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            pincode: '500032',
            mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2960844890015!2d78.35907847516553!3d17.445424583457087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sT-Hub!5e0!3m2!1sen!2sin!4v1705666800000!5m2!1sen!2sin'
        },
        faqs: [
            {
                question: 'How do I become a verified vendor on WENWEX?',
                answer: 'Visit our vendor portal and complete the enterprise verification process. Our team reviews applications within 48 hours for qualified technology agencies.'
            },
            {
                question: 'What payment methods do you support?',
                answer: 'We support all major payment methods including credit/debit cards, bank transfers, UPI, and international wire transfers through our secure payment gateway.'
            },
            {
                question: 'Do you offer enterprise contracts?',
                answer: 'Yes, we provide custom enterprise agreements with dedicated account management, SLAs, and priority support for organizations with ongoing technology needs.'
            },
            {
                question: 'Is my business data secure on WENWEX?',
                answer: 'Absolutely. We implement enterprise-grade security with SOC 2 compliance, end-to-end encryption, and strict data governance policies.'
            }
        ]
    };

    // Upsert About page
    const { error: aboutError } = await supabase
        .from('page_contents')
        .upsert({
            page_slug: 'about',
            title: 'About WENWEX',
            subtitle: 'Empowering the Future of Global Tech Commerce',
            content: aboutContent,
            meta_title: 'About Us | WENWEX - Global Tech Commerce Marketplace',
            meta_desc: 'Learn about WENWEX - the premier global marketplace connecting businesses with verified technology service providers worldwide.',
            is_published: true
        }, { onConflict: 'page_slug' });

    if (aboutError) {
        console.log('⚠️ About page insert error:', aboutError.message);
    } else {
        console.log('✅ About page content seeded!');
    }

    // Upsert Contact page
    const { error: contactError } = await supabase
        .from('page_contents')
        .upsert({
            page_slug: 'contact',
            title: 'Contact WENWEX',
            subtitle: 'Let\'s Start a Conversation',
            content: contactContent,
            meta_title: 'Contact Us | WENWEX - Global Tech Commerce Marketplace',
            meta_desc: 'Get in touch with WENWEX. We\'re here to help with your technology needs, partnerships, and vendor inquiries.',
            is_published: true
        }, { onConflict: 'page_slug' });

    if (contactError) {
        console.log('⚠️ Contact page insert error:', contactError.message);
    } else {
        console.log('✅ Contact page content seeded!');
    }
}

async function main() {
    try {
        await createPageContentsTable();
        await seedDefaultPageContent();
        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

main();
