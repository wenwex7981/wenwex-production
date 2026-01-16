'use client';

import { useEffect } from 'react';
import { onAuthStateChange, getCurrentUser } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                const { user, error } = await getCurrentUser();
                if (user) {
                    // Map Supabase user to our store user
                    setUser({
                        id: user.id,
                        email: user.email!,
                        fullName: user.user_metadata.full_name || user.user_metadata.name || 'User',
                        avatarUrl: user.user_metadata.avatar_url,
                        role: user.user_metadata.role || 'BUYER',
                    });
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    fullName: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                    avatarUrl: session.user.user_metadata.avatar_url,
                    role: session.user.user_metadata.role || 'BUYER',
                });
            } else if (event === 'SIGNED_OUT') {
                logout();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading, logout]);

    return <>{children}</>;
}
