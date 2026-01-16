// ===========================================
// USER CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, NotFoundError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const userController = {
    // Get user profile
    getProfile: asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: { vendor: true },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                phone: user.phone,
                country: user.country,
                isEmailVerified: user.isEmailVerified,
                vendor: user.vendor,
                createdAt: user.createdAt,
            },
        });
    }),

    // Update user profile
    updateProfile: asyncHandler(async (req: Request, res: Response) => {
        const { fullName, phone, country } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                fullName,
                phone,
                country,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                country: user.country,
            },
        });
    }),

    // Delete user account (soft delete)
    deleteAccount: asyncHandler(async (req: Request, res: Response) => {
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { deletedAt: new Date() },
        });

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    }),

    // Get saved services
    getSavedServices: asyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const [savedServices, total] = await Promise.all([
            prisma.savedService.findMany({
                where: { userId: req.user!.id },
                include: {
                    service: {
                        include: {
                            vendor: {
                                select: { id: true, companyName: true, slug: true, logoUrl: true },
                            },
                            media: {
                                where: { type: 'IMAGE' },
                                take: 1,
                            },
                            category: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.savedService.count({ where: { userId: req.user!.id } }),
        ]);

        res.json({
            success: true,
            data: savedServices.map((s) => s.service),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        });
    }),

    // Save a service
    saveService: asyncHandler(async (req: Request, res: Response) => {
        const { serviceId } = req.params;

        // Check if service exists
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            throw new NotFoundError('Service not found');
        }

        // Save service (upsert to avoid duplicates)
        await prisma.savedService.upsert({
            where: {
                userId_serviceId: {
                    userId: req.user!.id,
                    serviceId,
                },
            },
            update: {},
            create: {
                userId: req.user!.id,
                serviceId,
            },
        });

        res.json({
            success: true,
            message: 'Service saved successfully',
        });
    }),

    // Unsave a service
    unsaveService: asyncHandler(async (req: Request, res: Response) => {
        const { serviceId } = req.params;

        await prisma.savedService.deleteMany({
            where: {
                userId: req.user!.id,
                serviceId,
            },
        });

        res.json({
            success: true,
            message: 'Service removed from saved',
        });
    }),

    // Get followed vendors
    getFollowing: asyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const [follows, total] = await Promise.all([
            prisma.follow.findMany({
                where: { userId: req.user!.id },
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
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.follow.count({ where: { userId: req.user!.id } }),
        ]);

        res.json({
            success: true,
            data: follows.map((f) => f.vendor),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        });
    }),
};
