// ===========================================
// VENDOR CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, UserRole, VendorStatus } from '@prisma/client';
import { asyncHandler, NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Generate unique slug
const generateSlug = async (companyName: string): Promise<string> => {
    const baseSlug = companyName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.vendor.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

export const vendorController = {
    // Get all vendors (public)
    getVendors: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 12, search, country, sortBy = 'rating', sortOrder = 'desc' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            status: VendorStatus.APPROVED,
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { companyName: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (country) {
            where.country = country;
        }

        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                select: {
                    id: true,
                    companyName: true,
                    slug: true,
                    logoUrl: true,
                    bannerUrl: true,
                    description: true,
                    country: true,
                    isVerified: true,
                    followersCount: true,
                    rating: true,
                    totalReviews: true,
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
                hasMore: Number(page) < Math.ceil(total / Number(limit)),
            },
        });
    }),

    // Get top vendors
    getTopVendors: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 6;

        const vendors = await prisma.vendor.findMany({
            where: {
                status: VendorStatus.APPROVED,
                deletedAt: null,
                isVerified: true,
            },
            select: {
                id: true,
                companyName: true,
                slug: true,
                logoUrl: true,
                description: true,
                isVerified: true,
                followersCount: true,
                rating: true,
            },
            orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
            take: limit,
        });

        res.json({
            success: true,
            data: vendors,
        });
    }),

    // Get single vendor by ID or slug
    getVendor: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const vendor = await prisma.vendor.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
                status: VendorStatus.APPROVED,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        services: { where: { status: 'APPROVED', deletedAt: null } },
                        portfolio: true,
                        shorts: { where: { isApproved: true, deletedAt: null } },
                    },
                },
            },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        // Check if current user follows this vendor
        let isFollowing = false;
        if (req.user) {
            const follow = await prisma.follow.findUnique({
                where: {
                    userId_vendorId: { userId: req.user.id, vendorId: vendor.id },
                },
            });
            isFollowing = !!follow;
        }

        res.json({
            success: true,
            data: {
                ...vendor,
                servicesCount: vendor._count.services,
                portfolioCount: vendor._count.portfolio,
                shortsCount: vendor._count.shorts,
                isFollowing,
            },
        });
    }),

    // Get vendor services
    getVendorServices: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const vendor = await prisma.vendor.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where: {
                    vendorId: vendor.id,
                    status: 'APPROVED',
                    deletedAt: null,
                },
                include: {
                    category: true,
                    subCategory: true,
                    media: { where: { type: 'IMAGE' }, take: 1 },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.service.count({
                where: { vendorId: vendor.id, status: 'APPROVED', deletedAt: null },
            }),
        ]);

        res.json({
            success: true,
            data: services,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        });
    }),

    // Get vendor portfolio
    getVendorPortfolio: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const vendor = await prisma.vendor.findFirst({
            where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        const portfolio = await prisma.vendorPortfolio.findMany({
            where: { vendorId: vendor.id },
            orderBy: { order: 'asc' },
        });

        res.json({
            success: true,
            data: portfolio,
        });
    }),

    // Get vendor shorts
    getVendorShorts: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const vendor = await prisma.vendor.findFirst({
            where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        });

        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        const shorts = await prisma.short.findMany({
            where: {
                vendorId: vendor.id,
                isApproved: true,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: shorts,
        });
    }),

    // Create vendor profile
    createVendor: asyncHandler(async (req: Request, res: Response) => {
        const { companyName, officialEmail, phone, country, description, website } = req.body;

        // Check if user already has a vendor profile
        const existingVendor = await prisma.vendor.findUnique({
            where: { userId: req.user!.id },
        });

        if (existingVendor) {
            throw new BadRequestError('You already have a vendor profile');
        }

        // Generate unique slug
        const slug = await generateSlug(companyName);

        // Create vendor profile
        const vendor = await prisma.vendor.create({
            data: {
                userId: req.user!.id,
                companyName,
                slug,
                officialEmail,
                phone,
                country,
                description,
                website: website || null,
                status: VendorStatus.PENDING,
            },
        });

        // Update user role to VENDOR
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { role: UserRole.VENDOR },
        });

        res.status(201).json({
            success: true,
            message: 'Vendor profile created. Pending admin approval.',
            data: vendor,
        });
    }),

    // Update vendor profile
    updateVendor: asyncHandler(async (req: Request, res: Response) => {
        const { companyName, officialEmail, phone, description, website, logoUrl, bannerUrl } = req.body;

        const vendor = await prisma.vendor.update({
            where: { id: req.user!.vendorId },
            data: {
                companyName,
                officialEmail,
                phone,
                description,
                website,
                logoUrl,
                bannerUrl,
            },
        });

        res.json({
            success: true,
            message: 'Vendor profile updated',
            data: vendor,
        });
    }),

    // Get vendor dashboard data
    getDashboard: asyncHandler(async (req: Request, res: Response) => {
        const vendorId = req.user!.vendorId;

        const [vendor, services, portfolio, shorts, followers, subscription] = await Promise.all([
            prisma.vendor.findUnique({ where: { id: vendorId } }),
            prisma.service.findMany({
                where: { vendorId, deletedAt: null },
                include: { _count: { select: { reviews: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma.vendorPortfolio.count({ where: { vendorId } }),
            prisma.short.count({ where: { vendorId, deletedAt: null } }),
            prisma.follow.count({ where: { vendorId } }),
            prisma.subscription.findFirst({
                where: { vendorId, status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        const stats = await prisma.service.aggregate({
            where: { vendorId, deletedAt: null },
            _sum: { viewCount: true },
            _count: true,
        });

        res.json({
            success: true,
            data: {
                vendor,
                stats: {
                    totalServices: stats._count,
                    totalViews: stats._sum.viewCount || 0,
                    totalPortfolio: portfolio,
                    totalShorts: shorts,
                    totalFollowers: followers,
                },
                recentServices: services,
                subscription,
            },
        });
    }),

    // Add portfolio item
    addPortfolioItem: asyncHandler(async (req: Request, res: Response) => {
        const { title, description, type, url, thumbnailUrl } = req.body;

        const maxOrder = await prisma.vendorPortfolio.aggregate({
            where: { vendorId: req.user!.vendorId },
            _max: { order: true },
        });

        const item = await prisma.vendorPortfolio.create({
            data: {
                vendorId: req.user!.vendorId!,
                title,
                description,
                type,
                url,
                thumbnailUrl,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Portfolio item added',
            data: item,
        });
    }),

    // Update portfolio item
    updatePortfolioItem: asyncHandler(async (req: Request, res: Response) => {
        const { itemId } = req.params;
        const { title, description, type, url, thumbnailUrl, order } = req.body;

        const item = await prisma.vendorPortfolio.findFirst({
            where: { id: itemId, vendorId: req.user!.vendorId },
        });

        if (!item) {
            throw new NotFoundError('Portfolio item not found');
        }

        const updated = await prisma.vendorPortfolio.update({
            where: { id: itemId },
            data: { title, description, type, url, thumbnailUrl, order },
        });

        res.json({
            success: true,
            message: 'Portfolio item updated',
            data: updated,
        });
    }),

    // Delete portfolio item
    deletePortfolioItem: asyncHandler(async (req: Request, res: Response) => {
        const { itemId } = req.params;

        const item = await prisma.vendorPortfolio.findFirst({
            where: { id: itemId, vendorId: req.user!.vendorId },
        });

        if (!item) {
            throw new NotFoundError('Portfolio item not found');
        }

        await prisma.vendorPortfolio.delete({ where: { id: itemId } });

        res.json({
            success: true,
            message: 'Portfolio item deleted',
        });
    }),

    // Submit verification documents
    submitVerification: asyncHandler(async (req: Request, res: Response) => {
        const { documents } = req.body;

        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            throw new BadRequestError('At least one verification document is required');
        }

        await prisma.vendor.update({
            where: { id: req.user!.vendorId },
            data: {
                verificationDocuments: documents,
                status: VendorStatus.PENDING,
            },
        });

        res.json({
            success: true,
            message: 'Verification documents submitted. Pending admin review.',
        });
    }),

    // Follow vendor
    followVendor: asyncHandler(async (req: Request, res: Response) => {
        const { id: vendorId } = req.params;

        const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) {
            throw new NotFoundError('Vendor not found');
        }

        await prisma.follow.upsert({
            where: {
                userId_vendorId: { userId: req.user!.id, vendorId },
            },
            update: {},
            create: {
                userId: req.user!.id,
                vendorId,
            },
        });

        // Update followers count
        await prisma.vendor.update({
            where: { id: vendorId },
            data: { followersCount: { increment: 1 } },
        });

        res.json({
            success: true,
            message: 'Now following vendor',
        });
    }),

    // Unfollow vendor
    unfollowVendor: asyncHandler(async (req: Request, res: Response) => {
        const { id: vendorId } = req.params;

        const follow = await prisma.follow.findUnique({
            where: {
                userId_vendorId: { userId: req.user!.id, vendorId },
            },
        });

        if (follow) {
            await prisma.follow.delete({
                where: { id: follow.id },
            });

            // Update followers count
            await prisma.vendor.update({
                where: { id: vendorId },
                data: { followersCount: { decrement: 1 } },
            });
        }

        res.json({
            success: true,
            message: 'Unfollowed vendor',
        });
    }),
};
