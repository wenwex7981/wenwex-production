// ===========================================
// VENDOR ROUTES
// ===========================================

import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller';
import { authenticate, optionalAuth, isVendor } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createVendorSchema = z.object({
    body: z.object({
        companyName: z.string().min(2).max(100),
        officialEmail: z.string().email(),
        phone: z.string().min(5).max(20),
        country: z.string().length(2),
        description: z.string().min(20).max(2000),
        website: z.string().url().optional().nullable(),
    }),
});

const updateVendorSchema = z.object({
    body: z.object({
        companyName: z.string().min(2).max(100).optional(),
        officialEmail: z.string().email().optional(),
        phone: z.string().min(5).max(20).optional(),
        description: z.string().min(20).max(2000).optional(),
        website: z.string().url().optional().nullable(),
        logoUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
    }),
});

const portfolioItemSchema = z.object({
    body: z.object({
        title: z.string().min(2).max(100),
        description: z.string().max(500).optional(),
        type: z.enum(['IMAGE', 'VIDEO', 'PDF', 'LINK']),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
    }),
});

// Public routes
router.get('/', vendorController.getVendors);
router.get('/top', vendorController.getTopVendors);
router.get('/:idOrSlug', optionalAuth, vendorController.getVendor);
router.get('/:idOrSlug/services', vendorController.getVendorServices);
router.get('/:idOrSlug/portfolio', vendorController.getVendorPortfolio);
router.get('/:idOrSlug/shorts', vendorController.getVendorShorts);

// Authenticated routes
router.post('/', authenticate, validate(createVendorSchema), vendorController.createVendor);
router.post('/:id/follow', authenticate, vendorController.followVendor);
router.delete('/:id/follow', authenticate, vendorController.unfollowVendor);

// Vendor-only routes
router.put('/me', authenticate, isVendor, validate(updateVendorSchema), vendorController.updateVendor);
router.get('/me/dashboard', authenticate, isVendor, vendorController.getDashboard);
router.post('/me/portfolio', authenticate, isVendor, validate(portfolioItemSchema), vendorController.addPortfolioItem);
router.put('/me/portfolio/:itemId', authenticate, isVendor, vendorController.updatePortfolioItem);
router.delete('/me/portfolio/:itemId', authenticate, isVendor, vendorController.deletePortfolioItem);
router.post('/me/verification', authenticate, isVendor, vendorController.submitVerification);

export default router;
