'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';

interface AdminAuthGuardProps {
    children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            // Skip auth check for login page
            if (pathname === '/login') {
                setIsAuthenticated(true);
                return;
            }

            const authStatus = localStorage.getItem('wenwex_admin_auth');
            const authExpiry = localStorage.getItem('wenwex_admin_auth_expiry');

            if (authStatus === 'true' && authExpiry) {
                const expiryTime = parseInt(authExpiry);
                if (Date.now() < expiryTime) {
                    setIsAuthenticated(true);
                } else {
                    // Session expired
                    localStorage.removeItem('wenwex_admin_auth');
                    localStorage.removeItem('wenwex_admin_auth_expiry');
                    localStorage.removeItem('wenwex_admin_user');
                    setIsAuthenticated(false);
                    router.push('/login');
                }
            } else {
                setIsAuthenticated(false);
                router.push('/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Loading state
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Verifying authentication...</p>
            </div>
        );
    }

    // Not authenticated - will redirect
    if (!isAuthenticated && pathname !== '/login') {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Redirecting to login...</p>
            </div>
        );
    }

    return <>{children}</>;
}

// Logout function to be used in admin pages
export function useAdminLogout() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem('wenwex_admin_auth');
        localStorage.removeItem('wenwex_admin_auth_expiry');
        localStorage.removeItem('wenwex_admin_user');
        router.push('/login');
    };

    return { logout };
}

// Get current admin user
export function useAdminUser() {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const adminUser = localStorage.getItem('wenwex_admin_user');
        setUser(adminUser);
    }, []);

    return user;
}
