// ===========================================
// SHORT (REELS) CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const shortController = {
    // Get all shorts (approved only)
    getShorts: asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, vendorId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            isApproved: true,
            deletedAt: null,
        };

        if (vendorId) {
            where.vendorId = vendorId;
        }

        const [shorts, total] = await Promise.all([
            prisma.short.findMany({
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
                    service: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            price: true,
                            currency: true,
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.short.count({ where }),
        ]);

        res.json({
            success: true,
            data: shorts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
                hasMore: Number(page) < Math.ceil(total / Number(limit)),
            },
        });
    }),

    // Get shorts feed (for discovery)
    getShortsFeed: asyncHandler(async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10;
        const cursor = req.query.cursor as string;

        const where: any = {
            isApproved: true,
            deletedAt: null,
        };

        if (cursor) {
            where.id = { lt: cursor };
        }

        const shorts = await prisma.short.findMany({
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
                service: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        currency: true,
                    },
                },
            },
            take: limit,
            orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        });

        const nextCursor = shorts.length === limit ? shorts[shorts.length - 1].id : null;

        res.json({
            success: true,
            data: shorts,
            nextCursor,
        });
    }),

    // Get single short
    getShort: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const short = await prisma.short.findFirst({
            where: {
                id,
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
                        bannerUrl: true,
                        isVerified: true,
                        followersCount: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        currency: true,
                        shortDescription: true,
                    },
                },
            },
        });

        if (!short) {
            throw new NotFoundError('Short not found');
        }

        res.json({
            success: true,
            data: short,
        });
    }),

    // Create short (vendor)
    createShort: asyncHandler(async (req: Request, res: Response) => {
        const { serviceId, title, videoUrl, thumbnailUrl } = req.body;

        // Check subscription
        const subscription = await prisma.subscription.findFirst({
            where: { vendorId: req.user!.vendorId, status: 'ACTIVE' },
        });

        if (!subscription) {
            throw new ForbiddenError('Active subscription required to upload shorts');
        }

        // If serviceId provided, verify ownership
        if (serviceId) {
            const service = await prisma.service.findFirst({
                where: { id: serviceId, vendorId: req.user!.vendorId },
            });
            if (!service) {
                throw new NotFoundError('Service not found');
            }
        }

        const short = await prisma.short.create({
            data: {
                vendorId: req.user!.vendorId!,
                serviceId,
                title,
                videoUrl,
                thumbnailUrl,
                isApproved: false, // Requires admin approval
            },
            include: {
                vendor: {
                    select: { id: true, companyName: true, slug: true },
                },
                service: {
                    select: { id: true, title: true, slug: true },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Short uploaded. Pending admin approval.',
            data: short,
        });
    }),

    // Update short
    updateShort: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, thumbnailUrl } = req.body;

        const short = await prisma.short.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!short) {
            throw new NotFoundError('Short not found');
        }

        const updated = await prisma.short.update({
            where: { id },
            data: { title, thumbnailUrl },
        });

        res.json({
            success: true,
            message: 'Short updated',
            data: updated,
        });
    }),

    // Delete short
    deleteShort: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const short = await prisma.short.findFirst({
            where: { id, vendorId: req.user!.vendorId },
        });

        if (!short) {
            throw new NotFoundError('Short not found');
        }

        await prisma.short.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        res.json({
            success: true,
            message: 'Short deleted',
        });
    }),

    // Like short
    likeShort: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const short = await prisma.short.findUnique({ where: { id } });
        if (!short) {
            throw new NotFoundError('Short not found');
        }

        await prisma.short.update({
            where: { id },
            data: { likesCount: { increment: 1 } },
        });

        res.json({
            success: true,
            message: 'Short liked',
        });
    }),

    // Unlike short
    unlikeShort: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const short = await prisma.short.findUnique({ where: { id } });
        if (!short) {
            throw new NotFoundError('Short not found');
        }

        await prisma.short.update({
            where: { id },
            data: { likesCount: { decrement: 1 } },
        });

        res.json({
            success: true,
            message: 'Short unliked',
        });
    }),

    // Record view
    recordView: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.short.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        res.json({
            success: true,
        });
    }),
};
