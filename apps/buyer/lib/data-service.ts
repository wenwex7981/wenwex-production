
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export async function fetchFeaturedServices() {
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'APPROVED')
        .eq('is_featured', true)
        .neq('service_type', 'ACADEMIC')
        .limit(4);

    if (sError) throw sError;
    if (!services) return [];

    const vendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name, slug, logo_url, is_verified')
        .in('id', vendorIds);

    return services.map(s => {
        const vendor = vendors?.find(v => v.id === s.vendor_id);
        return {
            ...s,
            vendor: vendor ? {
                name: vendor.company_name,
                slug: vendor.slug,
                logo: vendor.logo_url,
                is_verified: vendor.is_verified
            } : null
        };
    });
}

export async function fetchTrendingServices() {
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'APPROVED')
        .neq('service_type', 'ACADEMIC')
        .order('rating', { ascending: false })
        .limit(8);

    if (sError) throw sError;
    if (!services) return [];

    const vendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name, slug, logo_url, is_verified')
        .in('id', vendorIds);

    return services.map(s => {
        const vendor = vendors?.find(v => v.id === s.vendor_id);
        return {
            ...s,
            vendor: vendor ? {
                name: vendor.company_name,
                slug: vendor.slug,
                logo: vendor.logo_url,
                is_verified: vendor.is_verified
            } : null
        };
    });
}

export async function fetchCategories() {
    // Separate fetches to avoid PostgREST embedding ambiguity
    const [catRes, subRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_visible', true).order('order', { ascending: true }),
        supabase.from('sub_categories').select('*').eq('is_visible', true).order('order', { ascending: true })
    ]);

    if (catRes.error) throw catRes.error;

    return catRes.data.map(cat => ({
        ...cat,
        sub_categories: subRes.data?.filter(sub => sub.category_id === cat.id) || []
    }));
}

export async function fetchServiceBySlug(slug: string) {
    const { data: service, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();

    if (sError) throw sError;
    if (!service) return null;

    const [vendorRes, catRes, servicesCountRes] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', service.vendor_id).single(),
        supabase.from('categories').select('*').eq('id', service.category_id).single(),
        supabase.from('services').select('id', { count: 'exact' }).eq('vendor_id', service.vendor_id).eq('status', 'APPROVED')
    ]);

    // Add services_count to vendor data
    const vendorData = vendorRes.data ? {
        ...vendorRes.data,
        services_count: servicesCountRes.count || 0
    } : null;

    return {
        ...service,
        vendor: vendorData,
        category: catRes.data || null
    };
}
export async function fetchVendorBySlug(slugOrId: string) {
    // Try to fetch the vendor by slug first, then by id
    let vendor = null;
    let vError = null;

    // First try by slug
    const slugResult = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', slugOrId)
        .single();

    if (slugResult.error) {
        // If slug column doesn't exist or no match, try by id
        if (slugResult.error.code === '42703' || slugResult.error.code === 'PGRST116') {
            const idResult = await supabase
                .from('vendors')
                .select('*')
                .eq('id', slugOrId)
                .single();

            vendor = idResult.data;
            vError = idResult.error;
        } else {
            vError = slugResult.error;
        }
    } else {
        vendor = slugResult.data;
    }

    if (vError) {
        console.error('Error fetching vendor:', vError);
        return null;
    }
    if (!vendor) return null;

    // Fetch related data in parallel using separate queries to avoid relationship issues
    const [servicesRes, portfolioRes, photosRes, shortsRes, reviewsRes] = await Promise.all([
        supabase.from('services').select('*').eq('vendor_id', vendor.id).eq('status', 'APPROVED'),
        supabase.from('vendor_portfolio').select('*').eq('vendor_id', vendor.id),
        supabase.from('vendor_photos').select('*').eq('vendor_id', vendor.id),
        supabase.from('shorts').select('*').eq('vendor_id', vendor.id).eq('is_approved', true),
        supabase.from('reviews').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }).limit(20)
    ]);

    // Map fields for consistency with mock/legacy code
    return {
        ...vendor,
        companyName: vendor.company_name,
        logoUrl: vendor.logo_url,
        bannerUrl: vendor.banner_url,
        isVerified: vendor.is_verified,
        followersCount: vendor.followers_count || 0,
        totalReviews: vendor.total_reviews || reviewsRes.data?.length || 0,
        memberSince: vendor.created_at ? new Date(vendor.created_at).getFullYear().toString() : '2023',
        avgResponseTime: vendor.avg_response_time || '2 hours',
        website: vendor.website_url,
        location: vendor.country || vendor.location || 'India',
        country: vendor.country || 'IN',
        services: (servicesRes.data || []).map((s: any) => ({
            ...s,
            imageUrl: s.main_image_url || s.image_url,
            reviewCount: s.rating_count || 0
        })),
        portfolio: (portfolioRes.data || []).map((p: any) => ({
            ...p,
            thumbnailUrl: p.thumbnail_url || p.url,
            category: p.category || 'Project'
        })),
        photos: (photosRes.data || []).map((p: any) => ({
            ...p,
            url: p.url || p.image_url,
            title: p.title || 'Photo'
        })),
        shorts: (shortsRes.data || []).map((s: any) => ({
            ...s,
            thumbnailUrl: s.thumbnail_url || s.video_url,
            viewCount: s.view_count || 0
        })),
        reviews: (reviewsRes.data || []).map((r: any) => ({
            ...r,
            userName: r.user_name || 'Anonymous User',
            comment: r.comment || r.content,
            helpfulCount: r.helpful_count || 0,
            serviceTitle: r.service_title
        }))
    };
}

export async function fetchAllVendors() {
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching vendors:', error);
        return [];
    }

    return (vendors || []).map((v: any) => ({
        id: v.id,
        companyName: v.company_name || 'Unnamed Vendor',
        slug: v.slug || v.id, // Use id as fallback if slug doesn't exist
        logoUrl: v.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.company_name || 'V')}&background=0c8bff&color=fff&size=200`,
        bannerUrl: v.banner_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        description: v.description || 'Professional service provider on WENWEX marketplace.',
        country: v.country || 'US',
        isVerified: v.is_verified || false,
        rating: v.rating || 4.5,
        reviewCount: v.total_reviews || 0,
        followersCount: v.followers_count || 0,
        servicesCount: v.services_count || 0,
        categories: v.categories || ['Services']
    }));
}

export async function fetchAllServices(serviceType?: string) {
    let query = supabase
        .from('services')
        .select('*')
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false });

    // Filter by service type if provided
    if (serviceType) {
        query = query.eq('service_type', serviceType);
    } else {
        // Default: show only IT & TECH services on general services page
        query = query.neq('service_type', 'ACADEMIC');
    }

    const { data: services, error: sError } = await query;

    if (sError) {
        console.error('Error fetching services:', sError);
        return [];
    }
    if (!services) return [];

    // Fetch associated vendors
    const vendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name, slug, logo_url, is_verified')
        .in('id', vendorIds);

    // Fetch categories
    const categoryIds = [...new Set(services.map(s => s.category_id))].filter(Boolean);
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('id', categoryIds);

    return services.map(s => {
        const vendor = vendors?.find(v => v.id === s.vendor_id);
        const category = categories?.find(c => c.id === s.category_id);
        return {
            id: s.id,
            title: s.title || s.name || 'Untitled Service',
            slug: s.slug || s.id,
            shortDescription: s.description || 'Professional service on WENWEX marketplace.',
            price: s.price || 0,
            currency: 'USD',
            deliveryDays: s.delivery_days || 7,
            rating: s.rating || 0,
            reviewCount: s.rating_count || 0,
            imageUrl: s.main_image_url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800',
            vendor: vendor ? {
                name: vendor.company_name,
                slug: vendor.slug || vendor.id,
                isVerified: vendor.is_verified || false
            } : { name: 'WENWEX Vendor', slug: '', isVerified: false },
            category: category?.name || 'Services',
            serviceType: s.service_type || 'IT & TECH',
            features: s.features || [],
            domain: category?.name || 'CSE'
        };
    });
}

// Fetch ACADEMIC services specifically for the Academic page
export async function fetchAcademicServices() {
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'APPROVED')
        .eq('service_type', 'ACADEMIC')
        .order('created_at', { ascending: false });

    if (sError) {
        console.error('Error fetching academic services:', sError);
        return [];
    }
    if (!services) return [];

    // Fetch associated vendors
    const vendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name, slug, logo_url, is_verified')
        .in('id', vendorIds);

    // Fetch categories
    const categoryIds = [...new Set(services.map(s => s.category_id))].filter(Boolean);
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('id', categoryIds);

    return services.map(s => {
        const vendor = vendors?.find(v => v.id === s.vendor_id);
        const category = categories?.find(c => c.id === s.category_id);

        // Determine the academic category based on keywords or default
        let academicCategory = 'Major Projects';
        const title = (s.title || '').toLowerCase();
        if (title.includes('mini') || title.includes('small')) {
            academicCategory = 'Mini Projects';
        } else if (title.includes('research') || title.includes('paper') || title.includes('ieee')) {
            academicCategory = 'Research Paper Writing';
        }

        return {
            id: s.id,
            title: s.title || s.name || 'Untitled Project',
            slug: s.slug || s.id,
            category: academicCategory,
            domain: category?.name || 'CSE',
            price: s.price || 0,
            rating: s.rating || 4.5,
            reviews: s.rating_count || 0,
            delivery: `${s.delivery_days || 7} Days`,
            vendor: vendor?.company_name || 'WENWEX Vendor',
            vendorSlug: vendor?.slug || vendor?.id || '',
            isVerified: vendor?.is_verified || false,
            imageUrl: s.main_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            features: s.features || ['Source Code', 'Documentation', 'Support']
        };
    });
}

export async function fetchHomepageSections() {
    const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_visible', true)
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching homepage sections:', error);
        return [];
    }
    return data || [];
}

export async function fetchSiteSettings(): Promise<Record<string, any>> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier access
        const settingsObj: Record<string, any> = {};
        data?.forEach((item: any) => {
            settingsObj[item.key] = item.value;
        });
        return settingsObj;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        // Return default values if table doesn't exist
        return {
            site_name: 'WENVEX',
            site_tagline: 'Global Tech Commerce Hub',
            hero_title: 'Global Tech Commerce Hub.',
            hero_subtitle: 'Empowering the world\'s most innovative companies through elite technology partnerships, global scalability, and production-grade excellence.',
            hero_cta_primary_text: 'Get Started',
            hero_cta_primary_link: '/services',
            hero_cta_secondary_text: 'View Global Agencies',
            hero_cta_secondary_link: '/vendors',
            hero_banner_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000',
            stat_agencies: '500+',
            stat_agencies_label: 'Verified Agencies',
            stat_services: '10K+',
            stat_services_label: 'Services Listed',
            stat_clients: '50K+',
            stat_clients_label: 'Happy Clients',
            stat_rating: '4.9',
            stat_rating_label: 'Average Rating',
            contact_email: 'support@wenvex.online',
            contact_phone: '+91 9876543210',
            footer_copyright: '© 2024 WENVEX. All rights reserved.',
            footer_tagline: 'Connecting global talent with world-class opportunities.',
        };
    }
}

// ==========================================
// FOLLOWER MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Check if user is following a vendor
 */
export async function checkIsFollowing(vendorId: string, userId: string): Promise<boolean> {
    if (!vendorId || !userId) return false;

    try {
        const { data, error } = await supabase
            .from('vendor_followers')
            .select('id')
            .eq('vendor_id', vendorId)
            .eq('user_id', userId)
            .single();

        return !!data && !error;
    } catch (error) {
        return false;
    }
}

/**
 * Follow a vendor
 */
export async function followVendor(vendorId: string, userId: string): Promise<boolean> {
    if (!vendorId || !userId) return false;

    try {
        const { error } = await supabase
            .from('vendor_followers')
            .insert({
                vendor_id: vendorId,
                user_id: userId
            });

        if (error) {
            console.error('Error following vendor:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error following vendor:', error);
        return false;
    }
}

/**
 * Unfollow a vendor
 */
export async function unfollowVendor(vendorId: string, userId: string): Promise<boolean> {
    if (!vendorId || !userId) return false;

    try {
        const { error } = await supabase
            .from('vendor_followers')
            .delete()
            .eq('vendor_id', vendorId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error unfollowing vendor:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error unfollowing vendor:', error);
        return false;
    }
}

/**
 * Get list of followers for a vendor (with names)
 */
export async function getFollowersList(vendorId: string, limit: number = 10): Promise<any[]> {
    if (!vendorId) return [];

    try {
        const { data, error } = await supabase
            .from('vendor_followers')
            .select(`
                id,
                followed_at,
                user_id
            `)
            .eq('vendor_id', vendorId)
            .order('followed_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        // Get user details from auth.users or profiles table
        const userIds = data.map(f => f.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .in('id', userIds);

        return data.map(follower => {
            const profile = profiles?.find(p => p.id === follower.user_id);
            return {
                id: follower.id,
                userId: follower.user_id,
                followedAt: follower.followed_at,
                name: profile?.full_name || profile?.email?.split('@')[0] || 'WENWEX User',
                avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=80`
            };
        });
    } catch (error) {
        console.error('Error getting followers list:', error);
        return [];
    }
}

/**
 * Get real-time follower count for a vendor
 */
export async function getFollowerCount(vendorId: string): Promise<number> {
    if (!vendorId) return 0;

    try {
        const { count, error } = await supabase
            .from('vendor_followers')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendorId);

        return count || 0;
    } catch (error) {
        return 0;
    }
}

// ==========================================
// PAGE CONTENT (Admin Editable)
// ==========================================

/**
 * Fetch page content from database
 * Falls back to default content if not found
 */
export async function fetchPageContent(pageSlug: string): Promise<any> {
    try {
        const { data, error } = await supabase
            .from('page_contents')
            .select('*')
            .eq('page_slug', pageSlug)
            .eq('is_published', true)
            .single();

        if (error || !data) {
            // Return default content based on page
            return getDefaultPageContent(pageSlug);
        }

        return {
            ...data,
            content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content
        };
    } catch (error) {
        console.error('Error fetching page content:', error);
        return getDefaultPageContent(pageSlug);
    }
}

/**
 * Default page content - used when database content is not available
 */
function getDefaultPageContent(pageSlug: string): any {
    const defaults: Record<string, any> = {
        about: {
            pageSlug: 'about',
            title: 'About WENWEX',
            subtitle: 'Empowering the Future of Global Tech Commerce',
            metaTitle: 'About Us | WENWEX - Global Tech Commerce Marketplace',
            metaDesc: 'Learn about WENWEX - the premier global marketplace connecting businesses with verified technology service providers worldwide.',
            content: {
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
            }
        },
        contact: {
            pageSlug: 'contact',
            title: 'Contact WENWEX',
            subtitle: 'Let\'s Start a Conversation',
            metaTitle: 'Contact Us | WENWEX - Global Tech Commerce Marketplace',
            metaDesc: 'Get in touch with WENWEX. We\'re here to help with your technology needs, partnerships, and vendor inquiries.',
            content: {
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
                    title: 'Our Location',
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
            }
        }
    };

    return defaults[pageSlug] || {
        pageSlug,
        title: pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
        subtitle: '',
        content: {}
    };
}
