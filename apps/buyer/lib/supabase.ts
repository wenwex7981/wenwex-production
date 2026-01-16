// ===========================================
// SUPABASE CLIENT CONFIGURATION
// ===========================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client for client-side operations
export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance for convenience
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
};

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });
    return { data, error };
};

export const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
};

export const signOut = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

export const getSession = async () => {
    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
};

// Listen for auth changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    const supabase = getSupabaseClient();
    return supabase.auth.onAuthStateChange(callback);
};
