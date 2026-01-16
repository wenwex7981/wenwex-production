// ===========================================
// SEARCH CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, ServiceStatus, VendorStatus } from '@prisma/client';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const searchController = {
    // Global search (services + vendors)
    globalSearch: asyncHandler(async (req: Request, res: Response) => {
        const { q, type = 'all', page = 1, limit = 12, categoryId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = q as string;

        const results: any = {};

        // Search services
        if (type === 'all' || type === 'services') {
            const serviceWhere: any = {
                status: ServiceStatus.APPROVED,
                deletedAt: null,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { shortDescription: { contains: query, mode: 'insensitive' } },
                ],
            };

            if (categoryId) {
                serviceWhere.categoryId = categoryId;
            }

            const [services, servicesTotal] = await Promise.all([
                prisma.service.findMany({
                    where: serviceWhere,
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
                    skip: type === 'all' ? 0 : skip,
                    take: type === 'all' ? 6 : Number(limit),
                    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
                }),
                prisma.service.count({ where: serviceWhere }),
            ]);

            results.services = {
                data: services,
                total: servicesTotal,
            };
        }

        // Search vendors
        if (type === 'all' || type === 'vendors') {
            const vendorWhere: any = {
                status: VendorStatus.APPROVED,
                deletedAt: null,
                OR: [
                    { companyName: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            };

            const [vendors, vendorsTotal] = await Promise.all([
                prisma.vendor.findMany({
                    where: vendorWhere,
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
                    skip: type === 'all' ? 0 : skip,
                    take: type === 'all' ? 4 : Number(limit),
                    orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
                }),
                prisma.vendor.count({ where: vendorWhere }),
            ]);

            results.vendors = {
                data: vendors,
                total: vendorsTotal,
            };
        }

        res.json({
            success: true,
            query,
            data: results,
        });
    }),

    // Search services only
    searchServices: asyncHandler(async (req: Request, res: Response) => {
        const { q, page = 1, limit = 12, categoryId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = q as string;

        const where: any = {
            status: ServiceStatus.APPROVED,
            deletedAt: null,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { shortDescription: { contains: query, mode: 'insensitive' } },
                { techStack: { hasSome: [query] } },
            ],
        };

        if (categoryId) {
            where.categoryId = categoryId;
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
                orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
            }),
            prisma.service.count({ where }),
        ]);

        res.json({
            success: true,
            query,
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

    // Search vendors only
    searchVendors: asyncHandler(async (req: Request, res: Response) => {
        const { q, page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = q as string;

        const where: any = {
            status: VendorStatus.APPROVED,
            deletedAt: null,
            OR: [
                { companyName: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ],
        };

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
                    _count: {
                        select: {
                            services: { where: { status: 'APPROVED', deletedAt: null } },
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
            }),
            prisma.vendor.count({ where }),
        ]);

        res.json({
            success: true,
            query,
            data: vendors.map((v) => ({
                ...v,
                servicesCount: v._count.services,
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
                hasMore: Number(page) < Math.ceil(total / Number(limit)),
            },
        });
    }),

    // Get search suggestions
    getSuggestions: asyncHandler(async (req: Request, res: Response) => {
        const query = (req.query.q as string) || '';

        if (query.length < 2) {
            res.json({
                success: true,
                data: [],
            });
            return;
        }

        // Get service titles
        const services = await prisma.service.findMany({
            where: {
                status: ServiceStatus.APPROVED,
                deletedAt: null,
                title: { contains: query, mode: 'insensitive' },
            },
            select: { title: true },
            take: 5,
            distinct: ['title'],
        });

        // Get vendor names
        const vendors = await prisma.vendor.findMany({
            where: {
                status: VendorStatus.APPROVED,
                deletedAt: null,
                companyName: { contains: query, mode: 'insensitive' },
            },
            select: { companyName: true },
            take: 3,
            distinct: ['companyName'],
        });

        // Get category names
        const categories = await prisma.category.findMany({
            where: {
                isVisible: true,
                name: { contains: query, mode: 'insensitive' },
            },
            select: { name: true, slug: true },
            take: 3,
        });

        const suggestions = [
            ...services.map((s) => ({ type: 'service', text: s.title })),
            ...vendors.map((v) => ({ type: 'vendor', text: v.companyName })),
            ...categories.map((c) => ({ type: 'category', text: c.name, slug: c.slug })),
        ];

        res.json({
            success: true,
            data: suggestions,
        });
    }),
};
