// ===========================================
// CATEGORY CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, CategoryType } from '@prisma/client';
import { asyncHandler, NotFoundError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const categoryController = {
    // Get all categories
    getCategories: asyncHandler(async (req: Request, res: Response) => {
        const categories = await prisma.category.findMany({
            where: { isVisible: true },
            include: {
                subCategories: {
                    where: { isVisible: true },
                    orderBy: { order: 'asc' },
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

    // Get IT & Tech categories
    getITTechCategories: asyncHandler(async (req: Request, res: Response) => {
        const category = await prisma.category.findFirst({
            where: { type: CategoryType.IT_TECH, isVisible: true },
            include: {
                subCategories: {
                    where: { isVisible: true },
                    include: {
                        _count: {
                            select: {
                                services: { where: { status: 'APPROVED', deletedAt: null } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!category) {
            throw new NotFoundError('IT & Tech category not found');
        }

        res.json({
            success: true,
            data: {
                ...category,
                subCategories: category.subCategories.map((sub) => ({
                    ...sub,
                    servicesCount: sub._count.services,
                })),
            },
        });
    }),

    // Get Academic categories
    getAcademicCategories: asyncHandler(async (req: Request, res: Response) => {
        const category = await prisma.category.findFirst({
            where: { type: CategoryType.ACADEMIC, isVisible: true },
            include: {
                subCategories: {
                    where: { isVisible: true },
                    include: {
                        _count: {
                            select: {
                                services: { where: { status: 'APPROVED', deletedAt: null } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!category) {
            throw new NotFoundError('Academic category not found');
        }

        res.json({
            success: true,
            data: {
                ...category,
                subCategories: category.subCategories.map((sub) => ({
                    ...sub,
                    servicesCount: sub._count.services,
                })),
            },
        });
    }),

    // Get single category
    getCategory: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const category = await prisma.category.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
                isVisible: true,
            },
            include: {
                subCategories: {
                    where: { isVisible: true },
                    include: {
                        _count: {
                            select: {
                                services: { where: { status: 'APPROVED', deletedAt: null } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        services: { where: { status: 'APPROVED', deletedAt: null } },
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        res.json({
            success: true,
            data: {
                ...category,
                servicesCount: category._count.services,
                subCategories: category.subCategories.map((sub) => ({
                    ...sub,
                    servicesCount: sub._count.services,
                })),
            },
        });
    }),

    // Get subcategories for a category
    getSubCategories: asyncHandler(async (req: Request, res: Response) => {
        const { idOrSlug } = req.params;

        const category = await prisma.category.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        const subCategories = await prisma.subCategory.findMany({
            where: {
                categoryId: category.id,
                isVisible: true,
            },
            include: {
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
            data: subCategories.map((sub) => ({
                ...sub,
                servicesCount: sub._count.services,
            })),
        });
    }),
};
