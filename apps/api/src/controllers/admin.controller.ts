// ===========================================
// ADMIN CONTROLLER - SUPER ADMIN PANEL
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, VendorStatus, ServiceStatus, CategoryType } from '@prisma/client';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Helper to log admin actions
const logAdminAction = async (
    adminId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string
) => {
    await prisma.adminLog.create({
        data: {
            adminId,
            action,
            entityType,
            entityId,
            details: details || undefined,
            ipAddress,
        },
    });
};

// Generate slug
const generateSlug = async (name: string, table: 'category' | 'subCategory'): Promise<string> => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    const checkExists = async (s: string) => {
        if (table === 'category') {
            return await prisma.category.findUnique({ where: { slug: s } });
        } else {
            return await prisma.subCategory.findUnique({ where: { slug: s } });
        }
    };

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

export const adminController = {
    // ==================== DASHBOARD ====================

    getDashboard: asyncHandler(async (req: Request, res: Response) => {
        const [
            totalUsers,
            totalVendors,
            pendingVendors,
            totalServices,
            pendingServices,
            totalShorts,
            pendingShorts,
            activeSubscriptions,
        ] = await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.vendor.count({ where: { deletedAt: null } }),
            prisma.vendor.count({ where: { status: VendorStatus.PENDING, deletedAt: null } }),
            prisma.service.count({ where: { deletedAt: null } }),
            prisma.service.count({ where: { status: ServiceStatus.PENDING, deletedAt: null } }),
            prisma.short.count({ where: { deletedAt: null } }),
            prisma.short.count({ where: { isApproved: false, deletedAt: null } }),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        ]);

        // Recent activity
        const recentLogs = await prisma.adminLog.findMany({
            include: { admin: { select: { fullName: true, email: true } } },
            take: 10,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalVendors,
                    pendingVendors,
                    totalServices,
                    pendingServices,
                    totalShorts,
                    pendingShorts,
                    activeSubscriptions,
                },
                recentActivity: recentLogs,
            },
        });
    }),

    getAnalytics: asyncHandler(async (req: Request, res: Response) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get daily signups
        const dailySignups = await prisma.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
        });

        // Get vendor growth
        const vendorGrowth = await prisma.vendor.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: true,
        });

        // Top categories by services
        const topCategories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { services: { where: { status: 'APPROVED' } } },
                },
            },
            orderBy: { services: { _count: 'desc' } },
            take: 5,
        });

        res.json({
            success: true,
            data: {
                dailySignups,
                vendorGrowth,
                topCategories: topCategories.map((c) => ({
                    name: c.name,
                    servicesCount: c._count.services,
                })),
            },
        });
    }),

    // ==================== VENDOR MANAGEMENT ====================

    getVendors: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { companyName: { contains: search as string, mode: 'insensitive' } },
                { officialEmail: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                include: {
                    user: { select: { email: true, fullName: true } },
                    _count: { select: { services: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder },
            }),
            prisma.vendor.count({ where }),
        ]);

        res.json({
            success: true,
            data: vendors,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }),

    getVendor: asyncHandler(async (req: Request, res: Response) => {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.params.id },
            include: {
                user: true,
                services: { take: 10, orderBy: { createdAt: 'desc' } },
                subscriptions: { take: 5, orderBy: { createdAt: 'desc' } },
            },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        res.json({ success: true, data: vendor });
    }),

    updateVendorStatus: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, reason } = req.body;

        const vendor = await prisma.vendor.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === VendorStatus.REJECTED ? reason : null,
                isVerified: status === VendorStatus.APPROVED ? true : false,
            },
        });

        await logAdminAction(
            req.user!.id,
            `vendor_${status.toLowerCase()}`,
            'vendor',
            id,
            { reason }
        );

        res.json({
            success: true,
            message: `Vendor ${status.toLowerCase()}`,
            data: vendor,
        });
    }),

    updateVendor: asyncHandler(async (req: Request, res: Response) => {
        const vendor = await prisma.vendor.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'vendor_updated', 'vendor', req.params.id);

        res.json({ success: true, data: vendor });
    }),

    deleteVendor: asyncHandler(async (req: Request, res: Response) => {
        await prisma.vendor.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });

        await logAdminAction(req.user!.id, 'vendor_deleted', 'vendor', req.params.id);

        res.json({ success: true, message: 'Vendor deleted' });
    }),

    // ==================== SERVICE MANAGEMENT ====================

    getServices: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    vendor: { select: { companyName: true, slug: true } },
                    category: true,
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder },
            }),
            prisma.service.count({ where }),
        ]);

        res.json({
            success: true,
            data: services,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }),

    getService: asyncHandler(async (req: Request, res: Response) => {
        const service = await prisma.service.findUnique({
            where: { id: req.params.id },
            include: {
                vendor: true,
                category: true,
                subCategory: true,
                media: true,
            },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        res.json({ success: true, data: service });
    }),

    updateServiceStatus: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, reason } = req.body;

        const service = await prisma.service.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === ServiceStatus.REJECTED ? reason : null,
            },
        });

        await logAdminAction(
            req.user!.id,
            `service_${status.toLowerCase()}`,
            'service',
            id,
            { reason }
        );

        res.json({
            success: true,
            message: `Service ${status.toLowerCase()}`,
            data: service,
        });
    }),

    toggleServiceFeatured: asyncHandler(async (req: Request, res: Response) => {
        const service = await prisma.service.findUnique({ where: { id: req.params.id } });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        const updated = await prisma.service.update({
            where: { id: req.params.id },
            data: { isFeatured: !service.isFeatured },
        });

        await logAdminAction(
            req.user!.id,
            updated.isFeatured ? 'service_featured' : 'service_unfeatured',
            'service',
            req.params.id
        );

        res.json({ success: true, data: updated });
    }),

    deleteService: asyncHandler(async (req: Request, res: Response) => {
        await prisma.service.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });

        await logAdminAction(req.user!.id, 'service_deleted', 'service', req.params.id);

        res.json({ success: true, message: 'Service deleted' });
    }),

    // ==================== CATEGORY MANAGEMENT ====================

    getAllCategories: asyncHandler(async (req: Request, res: Response) => {
        const categories = await prisma.category.findMany({
            include: {
                subCategories: { orderBy: { order: 'asc' } },
                _count: { select: { services: true } },
            },
            orderBy: { order: 'asc' },
        });

        res.json({ success: true, data: categories });
    }),

    createCategory: asyncHandler(async (req: Request, res: Response) => {
        const { name, description, imageUrl, type, order, isVisible } = req.body;

        const slug = await generateSlug(name, 'category');

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                imageUrl,
                type,
                order: order || 0,
                isVisible: isVisible ?? true,
            },
        });

        await logAdminAction(req.user!.id, 'category_created', 'category', category.id);

        res.status(201).json({ success: true, data: category });
    }),

    updateCategory: asyncHandler(async (req: Request, res: Response) => {
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'category_updated', 'category', req.params.id);

        res.json({ success: true, data: category });
    }),

    deleteCategory: asyncHandler(async (req: Request, res: Response) => {
        // Check if category has services
        const servicesCount = await prisma.service.count({
            where: { categoryId: req.params.id },
        });

        if (servicesCount > 0) {
            throw new BadRequestError('Cannot delete category with existing services');
        }

        await prisma.category.delete({ where: { id: req.params.id } });

        await logAdminAction(req.user!.id, 'category_deleted', 'category', req.params.id);

        res.json({ success: true, message: 'Category deleted' });
    }),

    updateCategoryOrder: asyncHandler(async (req: Request, res: Response) => {
        const { order } = req.body;

        await prisma.category.update({
            where: { id: req.params.id },
            data: { order },
        });

        res.json({ success: true, message: 'Order updated' });
    }),

    createSubCategory: asyncHandler(async (req: Request, res: Response) => {
        const { categoryId } = req.params;
        const { name, description, imageUrl, order, isVisible } = req.body;

        const slug = await generateSlug(name, 'subCategory');

        const subCategory = await prisma.subCategory.create({
            data: {
                categoryId,
                name,
                slug,
                description,
                imageUrl,
                order: order || 0,
                isVisible: isVisible ?? true,
            },
        });

        await logAdminAction(req.user!.id, 'subcategory_created', 'subcategory', subCategory.id);

        res.status(201).json({ success: true, data: subCategory });
    }),

    updateSubCategory: asyncHandler(async (req: Request, res: Response) => {
        const subCategory = await prisma.subCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'subcategory_updated', 'subcategory', req.params.id);

        res.json({ success: true, data: subCategory });
    }),

    deleteSubCategory: asyncHandler(async (req: Request, res: Response) => {
        const servicesCount = await prisma.service.count({
            where: { subCategoryId: req.params.id },
        });

        if (servicesCount > 0) {
            throw new BadRequestError('Cannot delete subcategory with existing services');
        }

        await prisma.subCategory.delete({ where: { id: req.params.id } });

        await logAdminAction(req.user!.id, 'subcategory_deleted', 'subcategory', req.params.id);

        res.json({ success: true, message: 'Subcategory deleted' });
    }),

    // ==================== HOMEPAGE MANAGEMENT ====================

    getHomepageSections: asyncHandler(async (req: Request, res: Response) => {
        const sections = await prisma.homepageSection.findMany({
            orderBy: { order: 'asc' },
        });

        res.json({ success: true, data: sections });
    }),

    createHomepageSection: asyncHandler(async (req: Request, res: Response) => {
        const section = await prisma.homepageSection.create({
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'homepage_section_created', 'homepage', section.id);

        res.status(201).json({ success: true, data: section });
    }),

    updateHomepageSection: asyncHandler(async (req: Request, res: Response) => {
        const section = await prisma.homepageSection.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'homepage_section_updated', 'homepage', req.params.id);

        res.json({ success: true, data: section });
    }),

    deleteHomepageSection: asyncHandler(async (req: Request, res: Response) => {
        await prisma.homepageSection.delete({ where: { id: req.params.id } });

        await logAdminAction(req.user!.id, 'homepage_section_deleted', 'homepage', req.params.id);

        res.json({ success: true, message: 'Section deleted' });
    }),

    reorderHomepageSections: asyncHandler(async (req: Request, res: Response) => {
        const { sections } = req.body; // Array of { id, order }

        await Promise.all(
            sections.map((s: { id: string; order: number }) =>
                prisma.homepageSection.update({
                    where: { id: s.id },
                    data: { order: s.order },
                })
            )
        );

        res.json({ success: true, message: 'Sections reordered' });
    }),

    // ==================== SHORTS MODERATION ====================

    getShorts: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [shorts, total] = await Promise.all([
            prisma.short.findMany({
                where: { deletedAt: null },
                include: {
                    vendor: { select: { companyName: true, slug: true } },
                    service: { select: { title: true, slug: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder },
            }),
            prisma.short.count({ where: { deletedAt: null } }),
        ]);

        res.json({
            success: true,
            data: shorts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }),

    approveShort: asyncHandler(async (req: Request, res: Response) => {
        await prisma.short.update({
            where: { id: req.params.id },
            data: { isApproved: true },
        });

        await logAdminAction(req.user!.id, 'short_approved', 'short', req.params.id);

        res.json({ success: true, message: 'Short approved' });
    }),

    rejectShort: asyncHandler(async (req: Request, res: Response) => {
        await prisma.short.update({
            where: { id: req.params.id },
            data: { isApproved: false },
        });

        await logAdminAction(req.user!.id, 'short_rejected', 'short', req.params.id);

        res.json({ success: true, message: 'Short rejected' });
    }),

    deleteShort: asyncHandler(async (req: Request, res: Response) => {
        await prisma.short.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });

        await logAdminAction(req.user!.id, 'short_deleted', 'short', req.params.id);

        res.json({ success: true, message: 'Short deleted' });
    }),

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    getSubscriptionPricing: asyncHandler(async (req: Request, res: Response) => {
        const pricing = await prisma.subscriptionPricing.findMany({
            orderBy: [{ country: 'asc' }, { plan: 'asc' }],
        });

        res.json({ success: true, data: pricing });
    }),

    createSubscriptionPricing: asyncHandler(async (req: Request, res: Response) => {
        const pricing = await prisma.subscriptionPricing.create({
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'pricing_created', 'pricing', pricing.id);

        res.status(201).json({ success: true, data: pricing });
    }),

    updateSubscriptionPricing: asyncHandler(async (req: Request, res: Response) => {
        const pricing = await prisma.subscriptionPricing.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'pricing_updated', 'pricing', req.params.id);

        res.json({ success: true, data: pricing });
    }),

    deleteSubscriptionPricing: asyncHandler(async (req: Request, res: Response) => {
        await prisma.subscriptionPricing.delete({ where: { id: req.params.id } });

        await logAdminAction(req.user!.id, 'pricing_deleted', 'pricing', req.params.id);

        res.json({ success: true, message: 'Pricing deleted' });
    }),

    // ==================== COUNTRY MANAGEMENT ====================

    getCountries: asyncHandler(async (req: Request, res: Response) => {
        const countries = await prisma.country.findMany({
            orderBy: { name: 'asc' },
        });

        res.json({ success: true, data: countries });
    }),

    updateCountry: asyncHandler(async (req: Request, res: Response) => {
        const country = await prisma.country.update({
            where: { code: req.params.code },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'country_updated', 'country', req.params.code);

        res.json({ success: true, data: country });
    }),

    // ==================== USER MANAGEMENT ====================

    getUsers: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { fullName: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    isEmailVerified: true,
                    createdAt: true,
                },
                skip,
                take: Number(limit),
                orderBy: { [sortBy as string]: sortOrder },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }),

    getUser: asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { vendor: true },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.json({ success: true, data: user });
    }),

    updateUser: asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await logAdminAction(req.user!.id, 'user_updated', 'user', req.params.id);

        res.json({ success: true, data: user });
    }),

    deleteUser: asyncHandler(async (req: Request, res: Response) => {
        await prisma.user.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });

        await logAdminAction(req.user!.id, 'user_deleted', 'user', req.params.id);

        res.json({ success: true, message: 'User deleted' });
    }),

    // ==================== ADMIN LOGS ====================

    getLogs: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 50, sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                include: { admin: { select: { fullName: true, email: true } } },
                skip,
                take: Number(limit),
                orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
            }),
            prisma.adminLog.count(),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }),
};
