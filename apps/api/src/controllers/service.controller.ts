// ===========================================
// SERVICE CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, ServiceStatus } from '@prisma/client';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Generate unique slug
const generateSlug = async (title: string): Promise<string> => {
    const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.service.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

export const serviceController = {
    // Get all services (public)
    getServices: asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 12,
            search,
            categoryId,
            subCategoryId,
            vendorId,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            status: ServiceStatus.APPROVED,
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { shortDescription: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (categoryId) where.categoryId = categoryId;
        if (subCategoryId) where.subCategoryId = subCategoryId;
        if (vendorId) where.vendorId = vendorId;

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            id: true,
                            companyName: true,
                            slug: true,
                            logoUrl: true,
                            isVerified: true,
                            rating: true,
                        },
                    },
                    category: true,
                    subCategory: true,
                    media: {
                        where: { type: 'IMAGE' },
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
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
                hasMore: Number(page) < Math.ceil(total / Number(limit)),
            },
        });
    }),

    // Get featured services
    getFeaturedServices: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 8;

        const services = await prisma.service.findMany({
            where: {
                status: ServiceStatus.APPROVED,
                deletedAt: null,
                isFeatured: true,
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                        logoUrl: true,
                        isVerified: true,
                    },
                },
                category: true,
                media: { where: { type: 'IMAGE' }, take: 1 },
            },
            take: limit,
            orderBy: [{ rating: 'desc' }, { viewCount: 'desc' }],
        });

        res.json({
            success: true,
            data: services,
        });
    }),

    // Get trending services
    getTrendingServices: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 8;

        const services = await prisma.service.findMany({
            where: {
                status: ServiceStatus.APPROVED,
                deletedAt: null,
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                        logoUrl: true,
                        isVerified: true,
                    },
                },
                category: true,
                media: { where: { type: 'IMAGE' }, take: 1 },
            },
            take: limit,
            orderBy: [{ viewCount: 'desc' }, { rating: 'desc' }],
        });

        res.json({
            success: true,
            data: services,
        });
    }),

    // Get services by category
    getServicesByCategory: asyncHandler(async (req: Request, res: Response) => {
        const { categorySlug } = req.params;
        const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // Find category by slug
        let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
        let subCategory = null;

        if (!category) {
            // Check if it's a subcategory
            subCategory = await prisma.subCategory.findUnique({ where: { slug: categorySlug } });
            if (!subCategory) {
                throw new NotFoundError('Category not found');
            }
        }

        const where: any = {
            status: ServiceStatus.APPROVED,
            deletedAt: null,
        };

        if (category) {
            where.categoryId = category.id;
        } else if (subCategory) {
            where.subCategoryId = subCategory.id;
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            id: true,
                            companyName: true,
                            slug: true,
                            logoUrl: true,
                            isVerified: true,
                        },
                    },
                    category: true,
                    subCategory: true,
                    media: { where: { type: 'IMAGE' }, take: 1 },
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
            category: category || subCategory,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
                hasMore: Number(page) < Math.ceil(total / Number(limit)),
            },
        });
    }),

    // Get single service
    getService: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const service = await prisma.service.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
                status: ServiceStatus.APPROVED,
                deletedAt: null,
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                        logoUrl: true,
                        bannerUrl: true,
                        description: true,
                        isVerified: true,
                        followersCount: true,
                        rating: true,
                    },
                },
                category: true,
                subCategory: true,
                media: { orderBy: { order: 'asc' } },
                reviews: {
                    include: {
                        user: { select: { id: true, fullName: true, avatarUrl: true } },
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { reviews: true } },
            },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        // Increment view count
        await prisma.service.update({
            where: { id: service.id },
            data: { viewCount: { increment: 1 } },
        });

        // Check if user has saved this service
        let isSaved = false;
        if (req.user) {
            const saved = await prisma.savedService.findUnique({
                where: {
                    userId_serviceId: { userId: req.user.id, serviceId: service.id },
                },
            });
            isSaved = !!saved;
        }

        res.json({
            success: true,
            data: {
                ...service,
                reviewsCount: service._count.reviews,
                isSaved,
            },
        });
    }),

    // Get service reviews
    getServiceReviews: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { serviceId: id },
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.review.count({ where: { serviceId: id } }),
        ]);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        });
    }),

    // Get related services
    getRelatedServices: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 6;

        const service = await prisma.service.findUnique({ where: { id } });
        if (!service) {
            throw new NotFoundError('Service not found');
        }

        const related = await prisma.service.findMany({
            where: {
                id: { not: id },
                status: ServiceStatus.APPROVED,
                deletedAt: null,
                OR: [
                    { categoryId: service.categoryId },
                    { subCategoryId: service.subCategoryId },
                ],
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                        logoUrl: true,
                        isVerified: true,
                    },
                },
                media: { where: { type: 'IMAGE' }, take: 1 },
            },
            take: limit,
            orderBy: { rating: 'desc' },
        });

        res.json({
            success: true,
            data: related,
        });
    }),

    // Create service (vendor)
    createService: asyncHandler(async (req: Request, res: Response) => {
        const {
            categoryId,
            subCategoryId,
            title,
            description,
            shortDescription,
            price,
            currency,
            deliveryDays,
            techStack,
            features,
        } = req.body;

        // Check if vendor has active subscription
        const subscription = await prisma.subscription.findFirst({
            where: { vendorId: req.user!.vendorId, status: 'ACTIVE' },
        });

        if (!subscription) {
            throw new ForbiddenError('Active subscription required to create services');
        }

        const slug = await generateSlug(title);

        const service = await prisma.service.create({
            data: {
                vendorId: req.user!.vendorId!,
                categoryId,
                subCategoryId,
                title,
                slug,
                description,
                shortDescription,
                price,
                currency: currency || 'USD',
                deliveryDays,
                techStack: techStack || [],
                features: features || [],
                status: ServiceStatus.DRAFT,
            },
            include: {
                category: true,
                subCategory: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Service created as draft',
            data: service,
        });
    }),

    // Update service
    updateService: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        // Check ownership
        const service = await prisma.service.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        const updated = await prisma.service.update({
            where: { id },
            data: req.body,
            include: { category: true, subCategory: true },
        });

        res.json({
            success: true,
            message: 'Service updated',
            data: updated,
        });
    }),

    // Delete service (soft delete)
    deleteService: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const service = await prisma.service.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        await prisma.service.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        res.json({
            success: true,
            message: 'Service deleted',
        });
    }),

    // Add service media
    addServiceMedia: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { type, url, thumbnailUrl, order } = req.body;

        const service = await prisma.service.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        const media = await prisma.serviceMedia.create({
            data: {
                serviceId: id,
                type,
                url,
                thumbnailUrl,
                order: order || 0,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Media added',
            data: media,
        });
    }),

    // Delete service media
    deleteServiceMedia: asyncHandler(async (req: Request, res: Response) => {
        const { id, mediaId } = req.params;

        const service = await prisma.service.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        await prisma.serviceMedia.delete({ where: { id: mediaId } });

        res.json({
            success: true,
            message: 'Media deleted',
        });
    }),

    // Create review
    createReview: asyncHandler(async (req: Request, res: Response) => {
        const { id: serviceId } = req.params;
        const { rating, title, comment } = req.body;

        // Check if service exists
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            throw new NotFoundError('Service not found');
        }

        // Create or update review
        const review = await prisma.review.upsert({
            where: {
                userId_serviceId: { userId: req.user!.id, serviceId },
            },
            update: { rating, title, comment },
            create: {
                userId: req.user!.id,
                serviceId,
                rating,
                title,
                comment,
            },
        });

        // Update service rating
        const stats = await prisma.review.aggregate({
            where: { serviceId },
            _avg: { rating: true },
            _count: true,
        });

        await prisma.service.update({
            where: { id: serviceId },
            data: {
                rating: stats._avg.rating || 0,
                totalReviews: stats._count,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted',
            data: review,
        });
    }),

    // Submit for review
    submitForReview: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const service = await prisma.service.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!service) {
            throw new NotFoundError('Service not found');
        }

        if (service.status === ServiceStatus.PENDING) {
            throw new ForbiddenError('Service is already pending review');
        }

        await prisma.service.update({
            where: { id },
            data: { status: ServiceStatus.PENDING },
        });

        res.json({
            success: true,
            message: 'Service submitted for review',
        });
    }),
};
