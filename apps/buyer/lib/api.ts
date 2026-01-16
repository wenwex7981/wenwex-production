// ===========================================
// API CLIENT FOR WENWEX
// ===========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Load token from localStorage in browser
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('auth_token', token);
            } else {
                localStorage.removeItem('auth_token');
            }
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred');
        }
    }

    async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async uploadFile(
        endpoint: string,
        file: File,
        fieldName: string = 'file'
    ): Promise<ApiResponse<{ url: string; path: string }>> {
        const url = `${this.baseUrl}${endpoint}`;
        const formData = new FormData();
        formData.append(fieldName, file);

        const headers: HeadersInit = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data;
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// ===========================================
// API ENDPOINTS HELPER
// ===========================================

export const endpoints = {
    // Auth
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        me: '/auth/me',
        google: '/auth/google',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
    },

    // Users
    users: {
        me: '/users/me',
        saved: '/users/me/saved',
        following: '/users/me/following',
    },

    // Vendors
    vendors: {
        list: '/vendors',
        top: '/vendors/top',
        get: (idOrSlug: string) => `/vendors/${idOrSlug}`,
        services: (idOrSlug: string) => `/vendors/${idOrSlug}/services`,
        portfolio: (idOrSlug: string) => `/vendors/${idOrSlug}/portfolio`,
        shorts: (idOrSlug: string) => `/vendors/${idOrSlug}/shorts`,
        follow: (id: string) => `/vendors/${id}/follow`,
        create: '/vendors',
        me: '/vendors/me',
        dashboard: '/vendors/me/dashboard',
    },

    // Services
    services: {
        list: '/services',
        featured: '/services/featured',
        trending: '/services/trending',
        get: (idOrSlug: string) => `/services/${idOrSlug}`,
        byCategory: (slug: string) => `/services/category/${slug}`,
        reviews: (id: string) => `/services/${id}/reviews`,
        related: (id: string) => `/services/${id}/related`,
        create: '/services',
    },

    // Categories
    categories: {
        list: '/categories',
        itTech: '/categories/it-tech',
        academic: '/categories/academic',
        get: (idOrSlug: string) => `/categories/${idOrSlug}`,
        subCategories: (idOrSlug: string) => `/categories/${idOrSlug}/subcategories`,
    },

    // Shorts
    shorts: {
        list: '/shorts',
        feed: '/shorts/feed',
        get: (id: string) => `/shorts/${id}`,
        create: '/shorts',
        like: (id: string) => `/shorts/${id}/like`,
        view: (id: string) => `/shorts/${id}/view`,
    },

    // Subscriptions
    subscriptions: {
        plans: '/subscriptions/plans',
        plansByCountry: (country: string) => `/subscriptions/plans/${country}`,
        current: '/subscriptions/current',
        history: '/subscriptions/history',
        create: '/subscriptions/create',
        cancel: '/subscriptions/cancel',
    },

    // Homepage
    homepage: {
        sections: '/homepage/sections',
        featured: '/homepage/featured',
        categories: '/homepage/categories',
        topAgencies: '/homepage/top-agencies',
        trending: '/homepage/trending',
        academic: '/homepage/academic',
        shorts: '/homepage/shorts',
    },

    // Search
    search: {
        global: '/search',
        services: '/search/services',
        vendors: '/search/vendors',
        suggestions: '/search/suggestions',
    },

    // Upload
    upload: {
        image: '/upload/image',
        video: '/upload/video',
        document: '/upload/document',
    },
};

export default api;
