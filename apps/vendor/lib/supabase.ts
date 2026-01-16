// ===========================================
// SUPABASE CLIENT CONFIGURATION (VENDOR)
// ===========================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('MISSING SUPABASE ENV VARS: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
}

export const createClient = () => {
    return createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');
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

export const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
};

export const getCurrentUser = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.getUser();
};

export const getSession = async () => {
    const supabase = getSupabaseClient();
    return await supabase.auth.getSession();
};
