
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export async function fetchFeaturedServices() {
    const { data: services, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'APPROVED')
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

