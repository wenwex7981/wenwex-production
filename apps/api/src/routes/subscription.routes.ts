// ===========================================
// SUBSCRIPTION ROUTES
// ===========================================

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate, isVendor } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createSubscriptionSchema = z.object({
    body: z.object({
        plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
        isYearly: z.boolean().optional().default(false),
    }),
});

// Public routes
router.get('/plans', subscriptionController.getPlans);
router.get('/plans/:country', subscriptionController.getPlansByCountry);

// Webhook (no auth - verified by signature)
router.post('/webhook', subscriptionController.handleWebhook);

// Vendor routes
router.get('/current', authenticate, isVendor, subscriptionController.getCurrentSubscription);
router.get('/history', authenticate, isVendor, subscriptionController.getSubscriptionHistory);
router.post('/create', authenticate, isVendor, validate(createSubscriptionSchema), subscriptionController.createSubscription);
router.post('/cancel', authenticate, isVendor, subscriptionController.cancelSubscription);

export default router;
