import { getSupabaseClient } from './supabase';

export async function testConnection() {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('vendors').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Error connecting to Supabase tables:', error.message);
            return false;
        }
        console.log('Supabase connection successful, vendors count:', data);
        return true;
    } catch (e) {
        console.error('Failed to connect:', e);
        return false;
    }
}
