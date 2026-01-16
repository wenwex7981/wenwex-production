// ===========================================
// WENVEX VALIDATION SCHEMAS (Zod)
// ===========================================

import { z } from 'zod';
import { UserRole, VendorStatus, ServiceStatus, SubscriptionPlan, MediaType, CategoryType } from '../types';

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(2, 'Full name is required').max(100),
    role: z.nativeEnum(UserRole).optional().default(UserRole.BUYER),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ==================== USER SCHEMAS ====================

export const updateUserSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).max(20).optional(),
    country: z.string().min(2).max(2).optional(),
    avatarUrl: z.string().url().optional(),
});

// ==================== VENDOR SCHEMAS ====================

export const createVendorSchema = z.object({
    companyName: z.string().min(2, 'Company name is required').max(200),
    officialEmail: z.string().email('Invalid official email'),
    phone: z.string().min(10, 'Phone number is required').max(20),
    country: z.string().min(2, 'Country is required').max(2),
    description: z.string().max(2000).optional(),
    website: z.string().url().optional().or(z.literal('')),
});

export const updateVendorSchema = z.object({
    companyName: z.string().min(2).max(200).optional(),
    officialEmail: z.string().email().optional(),
    phone: z.string().min(10).max(20).optional(),
    description: z.string().max(2000).optional(),
    website: z.string().url().optional().or(z.literal('')),
    logoUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
});

export const vendorVerificationSchema = z.object({
    documents: z.array(z.string().url()).min(1, 'At least one verification document is required'),
});

// ==================== SERVICE SCHEMAS ====================

export const createServiceSchema = z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    subCategoryId: z.string().uuid('Invalid subcategory ID').optional(),
    title: z.string().min(10, 'Title must be at least 10 characters').max(200),
    description: z.string().min(100, 'Description must be at least 100 characters').max(10000),
    shortDescription: z.string().max(300).optional(),
    price: z.number().positive('Price must be positive'),
    currency: z.string().length(3, 'Currency must be a 3-letter code'),
    deliveryDays: z.number().int().positive('Delivery days must be positive'),
    techStack: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ==================== CATEGORY SCHEMAS ====================

export const createCategorySchema = z.object({
    name: z.string().min(2, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    type: z.nativeEnum(CategoryType),
    order: z.number().int().nonnegative().optional(),
    isVisible: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubCategorySchema = z.object({
    name: z.string().min(2, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    order: z.number().int().nonnegative().optional(),
    isVisible: z.boolean().optional().default(true),
});

export const updateSubCategorySchema = createSubCategorySchema.partial();

// ==================== MEDIA SCHEMAS ====================

export const serviceMediaSchema = z.object({
    type: z.nativeEnum(MediaType),
    url: z.string().url('Invalid media URL'),
    thumbnailUrl: z.string().url().optional(),
    order: z.number().int().nonnegative().optional(),
});

export const portfolioItemSchema = z.object({
    title: z.string().min(2, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    type: z.nativeEnum(MediaType),
    url: z.string().url('Invalid URL'),
    thumbnailUrl: z.string().url().optional(),
    order: z.number().int().nonnegative().optional(),
});

// ==================== SHORT SCHEMAS ====================

export const createShortSchema = z.object({
    serviceId: z.string().uuid().optional(),
    title: z.string().max(200).optional(),
    videoUrl: z.string().url('Invalid video URL'),
    thumbnailUrl: z.string().url().optional(),
});

export const updateShortSchema = z.object({
    title: z.string().max(200).optional(),
    thumbnailUrl: z.string().url().optional(),
});

// ==================== REVIEW SCHEMAS ====================

export const createReviewSchema = z.object({
    serviceId: z.string().uuid('Invalid service ID'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    title: z.string().max(200).optional(),
    comment: z.string().max(2000).optional(),
});

// ==================== HOMEPAGE SCHEMAS ====================

export const homepageSectionSchema = z.object({
    type: z.enum(['featured_services', 'top_agencies', 'trending', 'academic_spotlight', 'shorts_preview', 'categories']),
    title: z.string().min(2).max(100),
    subtitle: z.string().max(200).optional(),
    order: z.number().int().nonnegative(),
    isVisible: z.boolean().optional().default(true),
    config: z.record(z.unknown()).optional(),
});

// ==================== SUBSCRIPTION SCHEMAS ====================

export const createSubscriptionSchema = z.object({
    plan: z.nativeEnum(SubscriptionPlan),
    isYearly: z.boolean().optional().default(false),
});

// ==================== ADMIN SCHEMAS ====================

export const vendorApprovalSchema = z.object({
    status: z.enum([VendorStatus.APPROVED, VendorStatus.REJECTED]),
    reason: z.string().max(500).optional(),
});

export const serviceApprovalSchema = z.object({
    status: z.enum([ServiceStatus.APPROVED, ServiceStatus.REJECTED]),
    reason: z.string().max(500).optional(),
});

export const countrySettingsSchema = z.object({
    code: z.string().length(2),
    isEnabled: z.boolean(),
});

export const subscriptionPricingSchema = z.object({
    plan: z.nativeEnum(SubscriptionPlan),
    country: z.string().length(2),
    currency: z.string().length(3),
    monthlyPrice: z.number().positive(),
    yearlyPrice: z.number().positive(),
    features: z.array(z.string()),
    isActive: z.boolean().optional().default(true),
});

// ==================== QUERY SCHEMAS ====================

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(12),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
});

export const serviceQuerySchema = paginationSchema.extend({
    categoryId: z.string().uuid().optional(),
    subCategoryId: z.string().uuid().optional(),
    vendorId: z.string().uuid().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    status: z.nativeEnum(ServiceStatus).optional(),
    isFeatured: z.coerce.boolean().optional(),
});

export const vendorQuerySchema = paginationSchema.extend({
    status: z.nativeEnum(VendorStatus).optional(),
    country: z.string().length(2).optional(),
    isVerified: z.coerce.boolean().optional(),
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubCategoryInput = z.infer<typeof createSubCategorySchema>;
export type UpdateSubCategoryInput = z.infer<typeof updateSubCategorySchema>;
export type ServiceMediaInput = z.infer<typeof serviceMediaSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type CreateShortInput = z.infer<typeof createShortSchema>;
export type UpdateShortInput = z.infer<typeof updateShortSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type VendorApprovalInput = z.infer<typeof vendorApprovalSchema>;
export type ServiceApprovalInput = z.infer<typeof serviceApprovalSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type VendorQueryInput = z.infer<typeof vendorQuerySchema>;
