// ===========================================
// SHORT (REELS) ROUTES
// ===========================================

import { Router } from 'express';
import { shortController } from '../controllers/short.controller';
import { authenticate, isVendor } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createShortSchema = z.object({
    body: z.object({
        serviceId: z.string().uuid().optional(),
        title: z.string().min(5).max(100),
        videoUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
    }),
});

const updateShortSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(100).optional(),
        thumbnailUrl: z.string().url().optional(),
    }),
});

// Public routes
router.get('/', shortController.getShorts);
router.get('/feed', shortController.getShortsFeed);
router.get('/:id', shortController.getShort);
router.post('/:id/view', shortController.recordView);

// Authenticated routes
router.post('/:id/like', authenticate, shortController.likeShort);
router.delete('/:id/like', authenticate, shortController.unlikeShort);

// Vendor routes
router.post('/', authenticate, isVendor, validate(createShortSchema), shortController.createShort);
router.put('/:id', authenticate, isVendor, validate(updateShortSchema), shortController.updateShort);
router.delete('/:id', authenticate, isVendor, shortController.deleteShort);

export default router;
