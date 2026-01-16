// ===========================================
// AUTH STORE (ZUSTAND)
// ===========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: 'BUYER' | 'VENDOR' | 'SUPER_ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => set({ token }),
            setLoading: (isLoading) => set({ isLoading }),

            login: (user, token) => set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            }),
        }),
        {
            name: 'wenvex-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
