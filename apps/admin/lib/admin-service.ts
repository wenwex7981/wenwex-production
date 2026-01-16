
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export async function initializeTables() {
    // Tables are managed via Prisma/Supabase SQL
}

export async function fetchVendors() {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateVendorStatus(id: string, status: string, reason?: string) {
    const { data, error } = await supabase
        .from('vendors')
        .update({ status, rejection_reason: reason })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function fetchPendingApprovals() {
    // We'll fetch separately to avoid relationship ambiguity errors
    const [vendorsResult, servicesResult] = await Promise.all([
        supabase.from('vendors').select('*').eq('status', 'PENDING'),
        supabase.from('services').select('*').eq('status', 'PENDING')
    ]);

    if (vendorsResult.error) throw vendorsResult.error;
    if (servicesResult.error) throw servicesResult.error;

    const vendors = vendorsResult.data || [];
    const services = servicesResult.data || [];

    // To get vendor names for services, we need to fetch those vendors too
    const serviceVendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: serviceVendors } = await supabase
        .from('vendors')
        .select('id, company_name')
        .in('id', serviceVendorIds);

    const joinedServices = services.map(s => ({
        ...s,
        vendor: serviceVendors?.find(v => v.id === s.vendor_id) || null
    }));

    return { vendors, services: joinedServices };
}

export async function fetchAdminDashboardStats() {
    // Head counts are safe from join issues
    const [u, v, s, p] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
    ]);

    return {
        users: u.count || 0,
        vendors: v.count || 0,
        services: s.count || 0,
        pending: p.count || 0
    };
}

export async function fetchServices() {
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

    if (sError) throw sError;
    if (!services) return [];

    const vendorIds = [...new Set(services.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name')
        .in('id', vendorIds);

    return services.map(s => ({
        ...s,
        vendor: vendors?.find(v => v.id === s.vendor_id) || null
    }));
}

export async function updateServiceStatus(id: string, status: string, reason?: string) {
    const { data, error } = await supabase
        .from('services')
        .update({ status, rejection_reason: reason })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function updateService(id: string, serviceData: any) {
    const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

export async function fetchCategories() {
    // PERMANENT FIX: Fetch separately and join in memory 
    // This bypasses all "more than one relationship found" errors 
    const [catRes, subRes] = await Promise.all([
        supabase.from('categories').select('*').order('order', { ascending: true }),
        supabase.from('sub_categories').select('*').order('order', { ascending: true })
    ]);

    if (catRes.error) throw catRes.error;
    if (subRes.error) throw subRes.error;

    return catRes.data.map(cat => ({
        ...cat,
        sub_categories: subRes.data?.filter(sub => sub.category_id === cat.id) || []
    }));
}

export async function createService(serviceData: any) {
    const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

    if (error) throw error;
    return data;
}

export async function createCategory(categoryData: any) {
    const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();

    if (error) throw error;
    return data;
}

export async function updateCategory(id: string, categoryData: any) {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function createSubCategory(subCategoryData: any) {
    const { data, error } = await supabase
        .from('sub_categories')
        .insert([subCategoryData])
        .select();

    if (error) throw error;
    return data;
}

export async function fetchUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateUser(id: string, userData: any) {
    const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

export async function deleteUser(id: string) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function fetchVendorBySlug(slug: string) {
    const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) throw error;
    if (!vendor) return null;

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', vendor.user_id)
        .single();

    return { ...vendor, user };
}

export async function updateVendor(id: string, vendorData: any) {
    // Filter to only include fields that exist in the vendors table
    const knownFields = [
        'company_name', 'slug', 'description', 'logo_url', 'banner_url',
        'official_email', 'phone_number', 'whatsapp_number', 'website_url', 'country',
        'founded_year', 'team_size', 'projects_done', 'satisfaction_rate',
        'is_verified', 'rating', 'total_reviews', 'followers_count', 'response_time',
        'status', 'rejection_reason'
    ];

    const filteredData: any = {};
    for (const key of Object.keys(vendorData)) {
        if (knownFields.includes(key) && vendorData[key] !== undefined) {
            filteredData[key] = vendorData[key];
        }
    }

    try {
        const { data, error } = await supabase
            .from('vendors')
            .update(filteredData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Error updating vendor:', error);
        throw new Error(error.message || 'Failed to update vendor');
    }
}

export async function fetchHomepageSections() {
    const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('order', { ascending: true });

    if (error) throw error;
    return data;
}

export async function initializeHomepage() {
    const defaultSections = [
        {
            title: 'Hero Section',
            subtitle: 'Supercharge your business with premium services',
            type: 'HERO',
            is_visible: true,
            order: 1,
            config: {
                banner_image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000',
                featured_vendor: 'PixelPerfect Design',
                stats: [
                    { value: '500+', label: 'Verified Agencies', icon: 'Shield' },
                    { value: '10K+', label: 'Services Listed', icon: 'Zap' },
                    { value: '50K+', label: 'Happy Clients', icon: 'Users' },
                    { value: '4.9', label: 'Average Rating', icon: 'Star' }
                ],
                primary_cta: { text: 'Watch Showcase', link: '#' },
                secondary_cta: { text: 'Explore Services', link: '/services' }
            }
        },
        {
            title: 'Explore Categories',
            subtitle: 'Find the right talent for your business',
            type: 'CATEGORIES',
            is_visible: true,
            order: 2,
            config: {}
        },
        {
            title: 'Featured Services',
            subtitle: 'Handpicked high-quality services from our community',
            type: 'FEATURED_SERVICES',
            is_visible: true,
            order: 3,
            config: { limit: 4 }
        },
        {
            title: 'Top Rated Agencies',
            subtitle: 'Work with the best in the industry',
            type: 'TOP_AGENCIES',
            is_visible: true,
            order: 4,
            config: { limit: 6 }
        },
        {
            title: 'Trending Now',
            subtitle: 'Most popular services this week',
            type: 'TRENDING_SERVICES',
            is_visible: true,
            order: 5,
            config: { limit: 8 }
        },
        {
            title: 'Academic Excellence',
            subtitle: 'Premium academic services from specialized experts',
            type: 'ACADEMIC_SPOTLIGHT',
            is_visible: true,
            order: 6,
            config: {
                banner_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000'
            }
        },
        {
            title: 'Ready to Scale?',
            subtitle: 'Join thousands of businesses that trust WENWEX for their project needs.',
            type: 'CTA',
            is_visible: true,
            order: 7,
            config: {
                banner_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000',
                primary_cta: { text: 'Get Started Now', link: '/onboarding' },
                secondary_cta: { text: 'Browse Services', link: '/services' }
            }
        }
    ];

    const { data, error } = await supabase
        .from('homepage_sections')
        .insert(defaultSections)
        .select();

    if (error) throw error;
    return data;
}

export async function updateHomepageSection(id: string, sectionData: any) {
    const { data, error } = await supabase
        .from('homepage_sections')
        .update(sectionData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

export async function fetchCountries() {
    const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
}

export async function updateCountry(code: string, countryData: any) {
    const { data, error } = await supabase
        .from('countries')
        .update(countryData)
        .eq('code', code)
        .select();

    if (error) throw error;
    return data;
}

export async function fetchSubscriptionPricing() {
    const { data, error } = await supabase
        .from('subscription_pricing')
        .select('*')
        .order('monthly_price', { ascending: true });

    if (error) throw error;
    return data;
}

export async function updateSubscriptionPricing(id: string, pricingData: any) {
    const { data, error } = await supabase
        .from('subscription_pricing')
        .update(pricingData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

export async function fetchShorts() {
    const { data: shorts, error: sError } = await supabase
        .from('shorts')
        .select('*')
        .order('created_at', { ascending: false });

    if (sError) throw sError;
    if (!shorts) return [];

    const vendorIds = [...new Set(shorts.map(s => s.vendor_id))].filter(Boolean);
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, company_name')
        .in('id', vendorIds);

    return shorts.map(s => ({
        ...s,
        vendor: vendors?.find(v => v.id === s.vendor_id) || null
    }));
}

export async function updateShortStatus(id: string, isApproved: boolean) {
    const { data, error } = await supabase
        .from('shorts')
        .update({ is_approved: isApproved })
        .eq('id', id);

    if (error) throw error;
    return data;
}
