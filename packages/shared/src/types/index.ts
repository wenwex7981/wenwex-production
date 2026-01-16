// ===========================================
// WENVEX SHARED TYPES
// ===========================================

// ==================== ENUMS ====================

export enum UserRole {
    BUYER = 'BUYER',
    VENDOR = 'VENDOR',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum VendorStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
}

export enum ServiceStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
}

export enum SubscriptionPlan {
    STARTER = 'STARTER',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE',
}

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    PDF = 'PDF',
    SHORT = 'SHORT',
}

export enum CategoryType {
    IT_TECH = 'IT_TECH',
    ACADEMIC = 'ACADEMIC',
}

// ==================== INTERFACES ====================

export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    isEmailVerified: boolean;
    phone?: string;
    country?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Vendor {
    id: string;
    userId: string;
    companyName: string;
    slug: string;
    officialEmail: string;
    phone: string;
    country: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    website?: string;
    isVerified: boolean;
    verificationDocuments?: string[];
    status: VendorStatus;
    followersCount: number;
    rating: number;
    totalReviews: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    type: CategoryType;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubCategory {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    id: string;
    vendorId: string;
    categoryId: string;
    subCategoryId?: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    price: number;
    currency: string;
    deliveryDays: number;
    techStack?: string[];
    features?: string[];
    status: ServiceStatus;
    isFeatured: boolean;
    viewCount: number;
    rating: number;
    totalReviews: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceMedia {
    id: string;
    serviceId: string;
    type: MediaType;
    url: string;
    thumbnailUrl?: string;
    order: number;
    createdAt: Date;
}

export interface VendorPortfolio {
    id: string;
    vendorId: string;
    title: string;
    description?: string;
    type: MediaType;
    url: string;
    thumbnailUrl?: string;
    order: number;
    createdAt: Date;
}

export interface Short {
    id: string;
    vendorId: string;
    serviceId?: string;
    title?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    viewCount: number;
    likesCount: number;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Follow {
    id: string;
    userId: string;
    vendorId: string;
    createdAt: Date;
}

export interface Subscription {
    id: string;
    vendorId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    priceAmount: number;
    currency: string;
    startDate: Date;
    endDate: Date;
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Review {
    id: string;
    userId: string;
    serviceId: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminLog {
    id: string;
    adminId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    createdAt: Date;
}

// ==================== API TYPES ====================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface PaginatedQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

// ==================== HOMEPAGE TYPES ====================

export interface HomepageSection {
    id: string;
    type: 'featured_services' | 'top_agencies' | 'trending' | 'academic_spotlight' | 'shorts_preview' | 'categories';
    title: string;
    subtitle?: string;
    order: number;
    isVisible: boolean;
    config?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SUBSCRIPTION PRICING ====================

export interface SubscriptionPricing {
    id: string;
    plan: SubscriptionPlan;
    country: string;
    currency: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Country {
    code: string;
    name: string;
    currency: string;
    currencySymbol: string;
    isEnabled: boolean;
}
