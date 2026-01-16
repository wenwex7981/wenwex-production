// ===========================================
// HOMEPAGE CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, CategoryType, ServiceStatus, VendorStatus } from '@prisma/client';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const homepageController = {
    // Get all homepage sections configuration
    getSections: asyncHandler(async (req: Request, res: Response) => {
        const sections = await prisma.homepageSection.findMany({
            where: { isVisible: true },
            orderBy: { order: 'asc' },
        });

        res.json({
            success: true,
            data: sections,
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
                media: {
                    where: { type: 'IMAGE' },
                    take: 1,
                    orderBy: { order: 'asc' },
                },
            },
            take: limit,
            orderBy: [{ rating: 'desc' }, { viewCount: 'desc' }],
        });

        res.json({
            success: true,
            data: services,
        });
    }),

    // Get categories for homepage
    getCategories: asyncHandler(async (req: Request, res: Response) => {
        const categories = await prisma.category.findMany({
            where: { isVisible: true },
            include: {
                subCategories: {
                    where: { isVisible: true },
                    orderBy: { order: 'asc' },
                    take: 6,
                },
                _count: {
                    select: {
                        services: { where: { status: 'APPROVED', deletedAt: null } },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });

        res.json({
            success: true,
            data: categories.map((cat) => ({
                ...cat,
                servicesCount: cat._count.services,
            })),
        });
    }),

    // Get top agencies
    getTopAgencies: asyncHandler(async (req: Request, res: Response) => {
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
                bannerUrl: true,
                description: true,
                isVerified: true,
                followersCount: true,
                rating: true,
                country: true,
                _count: {
                    select: {
                        services: { where: { status: 'APPROVED', deletedAt: null } },
                    },
                },
            },
            take: limit,
            orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
        });

        res.json({
            success: true,
            data: vendors.map((v) => ({
                ...v,
                servicesCount: v._count.services,
            })),
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
                media: {
                    where: { type: 'IMAGE' },
                    take: 1,
                    orderBy: { order: 'asc' },
                },
            },
            take: limit,
            orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        });

        res.json({
            success: true,
            data: services,
        });
    }),

    // Get academic services spotlight
    getAcademicSpotlight: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 6;

        // Find academic category
        const academicCategory = await prisma.category.findFirst({
            where: { type: CategoryType.ACADEMIC, isVisible: true },
        });

        if (!academicCategory) {
            res.json({
                success: true,
                data: [],
            });
            return;
        }

        const services = await prisma.service.findMany({
            where: {
                categoryId: academicCategory.id,
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
                subCategory: true,
                media: {
                    where: { type: 'IMAGE' },
                    take: 1,
                    orderBy: { order: 'asc' },
                },
            },
            take: limit,
            orderBy: [{ rating: 'desc' }, { viewCount: 'desc' }],
        });

        res.json({
            success: true,
            data: services,
        });
    }),

    // Get shorts preview for homepage
    getShortsPreview: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 4;

        const shorts = await prisma.short.findMany({
            where: {
                isApproved: true,
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
                service: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            take: limit,
            orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        });

        res.json({
            success: true,
            data: shorts,
        });
    }),
};
