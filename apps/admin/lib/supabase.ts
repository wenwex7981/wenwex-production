// ===========================================
// SUPABASE CLIENT CONFIGURATION (ADMIN)
// ===========================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
};

export const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.getUser();
};

export const getSession = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.getSession();
};
