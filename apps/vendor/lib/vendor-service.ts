
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export async function getCurrentVendor() {
    const { data: { user }, error: uError } = await supabase.auth.getUser();
    if (uError || !user) throw new Error('Not authenticated');

    const { data: vendor, error: vError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (vError && vError.code !== 'PGRST116') throw vError; // PGRST116 is "no rows found"
    return vendor;
}

export async function createVendor(vendorData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('vendors')
        .insert([{ ...vendorData, user_id: user.id, status: 'PENDING' }])
        .select();

    if (error) throw error;
    return data;
}

export async function updateVendorProfile(id: string, vendorData: any) {
    // Filter to only include fields that exist in the vendors table
    // This prevents errors if columns don't exist yet
    const knownFields = [
        'company_name', 'slug', 'description', 'logo_url', 'banner_url',
        'email', 'phone_number', 'whatsapp_number', 'website_url', 'country',
        'founded_year', 'team_size', 'projects_done', 'satisfaction_rate',
        'social_links', 'certifications', 'documents', 'is_verified',
        'rating', 'total_reviews', 'followers_count', 'response_time'
    ];

    const filteredData: any = {};
    for (const key of Object.keys(vendorData)) {
        if (knownFields.includes(key) && vendorData[key] !== undefined) {
            filteredData[key] = vendorData[key];
        }
    }

    // Try to update with all fields first
    const { data, error } = await supabase
        .from('vendors')
        .update(filteredData)
        .eq('id', id)
        .select();

    if (error) {
        // If there's a column error, try removing problematic fields
        if (error.message?.includes('column') || error.message?.includes('schema cache')) {
            console.warn('Some vendor fields may not exist, trying with basic fields...');
            const basicFields = ['company_name', 'slug', 'description', 'logo_url', 'email', 'phone_number'];
            const basicData: any = {};
            for (const key of basicFields) {
                if (vendorData[key] !== undefined) {
                    basicData[key] = vendorData[key];
                }
            }
            const { data: retryData, error: retryError } = await supabase
                .from('vendors')
                .update(basicData)
                .eq('id', id)
                .select();

            if (retryError) throw retryError;
            return retryData;
        }
        throw error;
    }
    return data;
}

export async function getVendorStats(vendorId: string) {
    // Basic stats for dashboard
    const { data: services, count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact' })
        .eq('vendor_id', vendorId);

    const { data: shorts, count: shortsCount } = await supabase
        .from('shorts')
        .select('*', { count: 'exact' })
        .eq('vendor_id', vendorId);

    // Placeholder for views/followers if tables exist later
    return {
        services: servicesCount || 0,
        shorts: shortsCount || 0,
        avgRating: services?.length ? (services.reduce((acc, s) => acc + (s.rating || 0), 0) / services.length) : 0,
    };
}

export async function fetchVendorServices(vendorId: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function fetchServiceById(id: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*, sub_categories(*)')
        .order('order', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createService(serviceData: any) {
    const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

    if (error) throw error;
    return data;
}

export async function updateService(id: string, serviceData: any) {
    // Filter to only include fields that exist in the services table
    const knownFields = [
        'title', 'name', 'slug', 'description', 'short_description', 'price',
        'category_id', 'sub_category_id', 'status', 'images', 'main_image_url',
        'delivery_days', 'revisions', 'service_type', 'tech_stack', 'features',
        'is_featured', 'view_count', 'rating', 'total_reviews', 'currency',
        'rejection_reason'
    ];

    const filteredData: any = {};
    for (const key of Object.keys(serviceData)) {
        if (knownFields.includes(key) && serviceData[key] !== undefined) {
            filteredData[key] = serviceData[key];
        }
    }

    const { data, error } = await supabase
        .from('services')
        .update(filteredData)
        .eq('id', id)
        .select();

    if (error) {
        // If there's a column error, try with basic fields only
        if (error.message?.includes('column') || error.message?.includes('schema cache')) {
            console.warn('Some service fields may not exist, trying with basic fields...');
            const basicFields = ['title', 'name', 'description', 'price', 'status', 'images'];
            const basicData: any = {};
            for (const key of basicFields) {
                if (serviceData[key] !== undefined) {
                    basicData[key] = serviceData[key];
                }
            }
            const { data: retryData, error: retryError } = await supabase
                .from('services')
                .update(basicData)
                .eq('id', id)
                .select();

            if (retryError) throw retryError;
            return retryData;
        }
        throw error;
    }
    return data;
}

export async function deleteService(id: string) {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function uploadMedia(bucket: string, file: File, folder: string = '') {
    if (!file) throw new Error('No file provided');

    // Check file size (limit to 10MB for now)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`Uploading to bucket: ${bucket}, path: ${filePath}`);

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Supabase Storage Error:', error);

        if (error.message?.includes('bucket not found')) {
            throw new Error(`CRITICAL: Storage bucket "${bucket}" not found. Please create a public bucket named "${bucket}" in your Supabase dashboard.`);
        }

        if (error.message?.includes('row-level security')) {
            throw new Error(`PERMISSION DENIED: You don't have permission to upload to "${bucket}". Please check your Supabase Storage RLS policies.`);
        }

        throw new Error(`Upload Failed: ${error.message} (Bucket: ${bucket})`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
}

export async function uploadServiceMedia(file: File, path: string) {
    return uploadMedia('services', file, path);
}

// Portfolio Management
export async function fetchVendorPortfolio(vendorId: string) {
    try {
        const { data, error } = await supabase
            .from('vendor_portfolio')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('order', { ascending: true });

        if (error) {
            console.error('Error fetching portfolio:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Error fetching vendor portfolio:', error);
        return [];
    }
}

export async function addPortfolioItem(itemData: any) {
    // Filter to only include known fields
    const knownFields = ['title', 'description', 'type', 'url', 'thumbnail_url', 'vendor_id', 'order'];

    const filteredData: any = {};
    for (const key of Object.keys(itemData)) {
        if (knownFields.includes(key) && itemData[key] !== undefined) {
            filteredData[key] = itemData[key];
        }
    }

    try {
        const { data, error } = await supabase
            .from('vendor_portfolio')
            .insert(filteredData)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error: any) {
        console.error('Error adding portfolio item:', error);
        throw new Error(error.message || 'Failed to add portfolio item');
    }
}

export async function deletePortfolioItem(id: string) {
    const { error } = await supabase
        .from('vendor_portfolio')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Shorts Management
export async function fetchVendorShorts(vendorId: string) {
    try {
        const { data: shorts, error } = await supabase
            .from('shorts')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!shorts || shorts.length === 0) return [];

        // Fetch linked services separately if any shorts have service_id
        const serviceIds = [...new Set(shorts.map(s => s.service_id))].filter(Boolean);
        let services: any[] = [];

        if (serviceIds.length > 0) {
            const { data: servicesData } = await supabase
                .from('services')
                .select('id, title')
                .in('id', serviceIds);
            services = servicesData || [];
        }

        // Merge service data with shorts
        return shorts.map(short => ({
            ...short,
            services: services.find(s => s.id === short.service_id) || null
        }));
    } catch (error) {
        console.error('Error fetching vendor shorts:', error);
        return [];
    }
}

export async function addShort(shortData: any) {
    // Filter to only include fields that should exist in shorts table
    const knownFields = ['title', 'video_url', 'thumbnail_url', 'vendor_id', 'service_id', 'is_approved', 'view_count', 'likes_count', 'comments_count'];

    const filteredData: any = {};
    for (const key of Object.keys(shortData)) {
        if (knownFields.includes(key) && shortData[key] !== undefined) {
            filteredData[key] = shortData[key];
        }
    }

    try {
        const { data, error } = await supabase
            .from('shorts')
            .insert(filteredData)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error: any) {
        console.error('Error adding short:', error);
        throw new Error(error.message || 'Failed to add short');
    }
}

export async function deleteShort(id: string) {
    const { error } = await supabase
        .from('shorts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
