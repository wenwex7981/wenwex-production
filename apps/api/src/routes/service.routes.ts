// ===========================================
// SERVICE ROUTES
// ===========================================

import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authenticate, optionalAuth, isVendor } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createServiceSchema = z.object({
    body: z.object({
        categoryId: z.string().uuid(),
        subCategoryId: z.string().uuid().optional(),
        title: z.string().min(5).max(150),
        description: z.string().min(50).max(5000),
        shortDescription: z.string().min(20).max(300),
        price: z.number().positive(),
        currency: z.enum(['USD', 'INR', 'EUR', 'GBP']).default('USD'),
        deliveryDays: z.number().int().positive(),
        techStack: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
    }),
});

const updateServiceSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(150).optional(),
        description: z.string().min(50).max(5000).optional(),
        shortDescription: z.string().min(20).max(300).optional(),
        price: z.number().positive().optional(),
        deliveryDays: z.number().int().positive().optional(),
        techStack: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
    }),
});

const mediaSchema = z.object({
    body: z.object({
        type: z.enum(['IMAGE', 'VIDEO', 'PDF']),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        order: z.number().int().min(0).optional(),
    }),
});

const reviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5),
        title: z.string().min(5).max(100).optional(),
        comment: z.string().min(10).max(1000).optional(),
    }),
});

// Public routes
router.get('/', serviceController.getServices);
router.get('/featured', serviceController.getFeaturedServices);
router.get('/trending', serviceController.getTrendingServices);
router.get('/category/:categorySlug', serviceController.getServicesByCategory);
router.get('/:idOrSlug', optionalAuth, serviceController.getService);
router.get('/:id/reviews', serviceController.getServiceReviews);
router.get('/:id/related', serviceController.getRelatedServices);

// Vendor routes
router.post('/', authenticate, isVendor, validate(createServiceSchema), serviceController.createService);
router.put('/:id', authenticate, isVendor, validate(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, isVendor, serviceController.deleteService);
router.post('/:id/submit', authenticate, isVendor, serviceController.submitForReview);
router.post('/:id/media', authenticate, isVendor, validate(mediaSchema), serviceController.addServiceMedia);
router.delete('/:id/media/:mediaId', authenticate, isVendor, serviceController.deleteServiceMedia);

// User routes
router.post('/:id/reviews', authenticate, validate(reviewSchema), serviceController.createReview);

export default router;
