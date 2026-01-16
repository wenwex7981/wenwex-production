// ===========================================
// WENVEX SHARED CONSTANTS
// ===========================================

// ==================== PLATFORM INFO ====================

export const PLATFORM = {
    name: 'WENVEX',
    domain: 'wenvex.online',
    email: 'wenvex19@gmail.com',
    phone: '+91 7981994870',
    company: 'Project Genie Tech Solutions',
    tagline: 'Global Tech-Commerce Marketplace',
    description: 'Where verified agencies and academic service providers sell services as structured products',
} as const;

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        GOOGLE: '/auth/google',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
    },

    // Users
    USERS: {
        ME: '/users/me',
        UPDATE: '/users/me',
        AVATAR: '/users/me/avatar',
    },

    // Vendors
    VENDORS: {
        LIST: '/vendors',
        GET: (id: string) => `/vendors/${id}`,
        CREATE: '/vendors',
        UPDATE: (id: string) => `/vendors/${id}`,
        PORTFOLIO: (id: string) => `/vendors/${id}/portfolio`,
        SERVICES: (id: string) => `/vendors/${id}/services`,
        SHORTS: (id: string) => `/vendors/${id}/shorts`,
        FOLLOW: (id: string) => `/vendors/${id}/follow`,
        UNFOLLOW: (id: string) => `/vendors/${id}/unfollow`,
    },

    // Services
    SERVICES: {
        LIST: '/services',
        GET: (id: string) => `/services/${id}`,
        CREATE: '/services',
        UPDATE: (id: string) => `/services/${id}`,
        DELETE: (id: string) => `/services/${id}`,
        MEDIA: (id: string) => `/services/${id}/media`,
        REVIEWS: (id: string) => `/services/${id}/reviews`,
        FEATURED: '/services/featured',
        TRENDING: '/services/trending',
    },

    // Categories
    CATEGORIES: {
        LIST: '/categories',
        GET: (id: string) => `/categories/${id}`,
        CREATE: '/categories',
        UPDATE: (id: string) => `/categories/${id}`,
        DELETE: (id: string) => `/categories/${id}`,
        SUBCATEGORIES: (id: string) => `/categories/${id}/subcategories`,
    },

    // Shorts
    SHORTS: {
        LIST: '/shorts',
        GET: (id: string) => `/shorts/${id}`,
        CREATE: '/shorts',
        UPDATE: (id: string) => `/shorts/${id}`,
        DELETE: (id: string) => `/shorts/${id}`,
        LIKE: (id: string) => `/shorts/${id}/like`,
    },

    // Subscriptions
    SUBSCRIPTIONS: {
        PLANS: '/subscriptions/plans',
        CREATE: '/subscriptions/create',
        CANCEL: '/subscriptions/cancel',
        CURRENT: '/subscriptions/current',
        HISTORY: '/subscriptions/history',
    },

    // Admin
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        VENDORS: '/admin/vendors',
        VENDOR_APPROVE: (id: string) => `/admin/vendors/${id}/approve`,
        VENDOR_REJECT: (id: string) => `/admin/vendors/${id}/reject`,
        SERVICES: '/admin/services',
        SERVICE_APPROVE: (id: string) => `/admin/services/${id}/approve`,
        SERVICE_REJECT: (id: string) => `/admin/services/${id}/reject`,
        SERVICE_FEATURE: (id: string) => `/admin/services/${id}/feature`,
        CATEGORIES: '/admin/categories',
        HOMEPAGE: '/admin/homepage',
        SHORTS: '/admin/shorts',
        USERS: '/admin/users',
        LOGS: '/admin/logs',
        COUNTRIES: '/admin/countries',
        SUBSCRIPTIONS: '/admin/subscriptions',
    },

    // Homepage
    HOMEPAGE: {
        SECTIONS: '/homepage/sections',
        FEATURED: '/homepage/featured',
        CATEGORIES: '/homepage/categories',
    },

    // Search
    SEARCH: {
        GLOBAL: '/search',
        SERVICES: '/search/services',
        VENDORS: '/search/vendors',
    },

    // Upload
    UPLOAD: {
        IMAGE: '/upload/image',
        VIDEO: '/upload/video',
        DOCUMENT: '/upload/document',
    },
} as const;

// ==================== PAGINATION ====================

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
} as const;

// ==================== FILE UPLOAD ====================

export const FILE_UPLOAD = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_SHORT_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB

    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],

    IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    VIDEO_EXTENSIONS: ['.mp4', '.webm', '.mov'],
    DOCUMENT_EXTENSIONS: ['.pdf'],
} as const;

// ==================== SUBSCRIPTION PLANS ====================

export const SUBSCRIPTION_PLANS = {
    STARTER: {
        name: 'Starter',
        services: 5,
        portfolio: 10,
        shorts: 5,
        support: 'Email',
    },
    PROFESSIONAL: {
        name: 'Professional',
        services: 25,
        portfolio: 50,
        shorts: 25,
        support: 'Priority Email',
    },
    ENTERPRISE: {
        name: 'Enterprise',
        services: -1, // Unlimited
        portfolio: -1,
        shorts: -1,
        support: 'Dedicated Manager',
    },
} as const;

// ==================== DEFAULT PRICING (USD) ====================

export const DEFAULT_PRICING = {
    STARTER: {
        monthly: 19,
        yearly: 190,
    },
    PROFESSIONAL: {
        monthly: 49,
        yearly: 490,
    },
    ENTERPRISE: {
        monthly: 99,
        yearly: 990,
    },
} as const;

// ==================== INDIA PRICING (INR) ====================

export const INDIA_PRICING = {
    STARTER: {
        monthly: 1499,
        yearly: 14990,
    },
    PROFESSIONAL: {
        monthly: 2999,
        yearly: 29990,
    },
    ENTERPRISE: {
        monthly: 4999,
        yearly: 49990,
    },
} as const;

// ==================== IT & TECH SUBCATEGORIES ====================

export const IT_TECH_SUBCATEGORIES = [
    {
        name: 'Web Application Development',
        slug: 'web-application-development',
        description: 'Custom web applications, portals, and SaaS solutions',
        icon: 'globe',
    },
    {
        name: 'Mobile App Development',
        slug: 'mobile-app-development',
        description: 'Native and cross-platform mobile applications',
        icon: 'smartphone',
    },
    {
        name: 'Custom Software',
        slug: 'custom-software',
        description: 'Tailored software solutions for your business needs',
        icon: 'code',
    },
    {
        name: 'UI/UX & Product Design',
        slug: 'ui-ux-product-design',
        description: 'User interface, experience design, and prototyping',
        icon: 'palette',
    },
    {
        name: 'Cloud & DevOps',
        slug: 'cloud-devops',
        description: 'Cloud infrastructure, CI/CD, and DevOps solutions',
        icon: 'cloud',
    },
    {
        name: 'AI & Data Solutions',
        slug: 'ai-data-solutions',
        description: 'Machine learning, AI, and data analytics services',
        icon: 'brain',
    },
    {
        name: 'Cybersecurity',
        slug: 'cybersecurity',
        description: 'Security audits, penetration testing, and compliance',
        icon: 'shield',
    },
    {
        name: 'QA & Testing',
        slug: 'qa-testing',
        description: 'Quality assurance, automated testing, and test automation',
        icon: 'check-circle',
    },
    {
        name: 'Automation & Tools',
        slug: 'automation-tools',
        description: 'Business process automation and custom tools',
        icon: 'cog',
    },
] as const;

// ==================== ACADEMIC SUBCATEGORIES ====================

export const ACADEMIC_SUBCATEGORIES = [
    {
        name: 'Mini Projects',
        slug: 'mini-projects',
        description: 'Small-scale academic projects for coursework',
        icon: 'file-code',
    },
    {
        name: 'Major Projects',
        slug: 'major-projects',
        description: 'Final year and capstone projects',
        icon: 'graduation-cap',
    },
    {
        name: 'Research Papers',
        slug: 'research-papers',
        description: 'Research assistance and paper writing',
        icon: 'file-text',
    },
    {
        name: 'Assignments',
        slug: 'assignments',
        description: 'Assignment help and solutions',
        icon: 'edit',
    },
    {
        name: 'Exam Preparation',
        slug: 'exam-preparation',
        description: 'Exam prep materials and tutoring',
        icon: 'book-open',
    },
    {
        name: 'Internship Assistance',
        slug: 'internship-assistance',
        description: 'Internship projects and career guidance',
        icon: 'briefcase',
    },
] as const;

// ==================== COUNTRIES ====================

export const SUPPORTED_COUNTRIES = [
    { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹' },
    { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£' },
    { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$' },
    { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$' },
    { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€' },
    { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ' },
    { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥' },
] as const;

// ==================== ROUTES ====================

export const ROUTES = {
    // Buyer
    BUYER: {
        HOME: '/',
        SERVICES: '/services',
        SERVICE_DETAIL: (slug: string) => `/services/${slug}`,
        CATEGORIES: '/categories',
        CATEGORY: (slug: string) => `/categories/${slug}`,
        VENDORS: '/vendors',
        VENDOR: (slug: string) => `/vendors/${slug}`,
        SHORTS: '/shorts',
        SEARCH: '/search',
        ACCOUNT: '/account',
        SAVED: '/account/saved',
        FOLLOWING: '/account/following',
        SETTINGS: '/account/settings',
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
    },

    // Vendor
    VENDOR: {
        DASHBOARD: '/dashboard',
        PROFILE: '/profile',
        SERVICES: '/services',
        SERVICE_NEW: '/services/new',
        SERVICE_EDIT: (id: string) => `/services/${id}/edit`,
        PORTFOLIO: '/portfolio',
        SHORTS: '/shorts',
        FOLLOWERS: '/followers',
        SUBSCRIPTION: '/subscription',
        SETTINGS: '/settings',
        ONBOARDING: '/onboarding',
    },

    // Admin
    ADMIN: {
        DASHBOARD: '/dashboard',
        VENDORS: '/vendors',
        VENDOR_DETAIL: (id: string) => `/vendors/${id}`,
        SERVICES: '/services',
        SERVICE_DETAIL: (id: string) => `/services/${id}`,
        CATEGORIES: '/categories',
        HOMEPAGE: '/homepage',
        SHORTS: '/shorts',
        SUBSCRIPTIONS: '/subscriptions',
        COUNTRIES: '/countries',
        USERS: '/users',
        LOGS: '/logs',
        SETTINGS: '/settings',
    },
} as const;
