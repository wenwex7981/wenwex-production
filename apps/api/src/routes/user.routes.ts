// ===========================================
// USER ROUTES
// ===========================================

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
    body: z.object({
        fullName: z.string().min(2).max(100).optional(),
        phone: z.string().max(20).optional(),
        country: z.string().length(2).optional(),
    }),
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/me', userController.getProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Saved services
router.get('/me/saved', userController.getSavedServices);
router.post('/me/saved/:serviceId', userController.saveService);
router.delete('/me/saved/:serviceId', userController.unsaveService);

// Following
router.get('/me/following', userController.getFollowing);

export default router;
