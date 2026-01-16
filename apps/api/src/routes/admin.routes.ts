// ===========================================
// ADMIN ROUTES (SUPER ADMIN ONLY)
// ===========================================

import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, isSuperAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// All routes require Super Admin authentication
router.use(authenticate);
router.use(isSuperAdmin);

// Validation schemas
const vendorStatusSchema = z.object({
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
        reason: z.string().max(500).optional(),
    }),
});

const serviceStatusSchema = z.object({
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
        reason: z.string().max(500).optional(),
    }),
});

const categorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500).optional(),
        imageUrl: z.string().url().optional(),
        type: z.enum(['IT_TECH', 'ACADEMIC']),
        order: z.number().int().min(0).optional(),
        isVisible: z.boolean().optional(),
    }),
});

const subCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500).optional(),
        imageUrl: z.string().url().optional(),
        order: z.number().int().min(0).optional(),
        isVisible: z.boolean().optional(),
    }),
});

const homepageSectionSchema = z.object({
    body: z.object({
        key: z.string().min(2).max(50),
        title: z.string().min(2).max(100),
        subtitle: z.string().max(200).optional(),
        type: z.string(),
        order: z.number().int().min(0).optional(),
        isVisible: z.boolean().optional(),
        config: z.record(z.unknown()).optional(),
    }),
});

const pricingSchema = z.object({
    body: z.object({
        plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
        country: z.string().length(2),
        currency: z.string().length(3),
        monthlyPrice: z.number().positive(),
        yearlyPrice: z.number().positive(),
        maxServices: z.number().int().positive(),
        maxShorts: z.number().int().positive(),
        isActive: z.boolean().optional(),
    }),
});

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

// Vendor management
router.get('/vendors', adminController.getVendors);
router.get('/vendors/:id', adminController.getVendor);
router.put('/vendors/:id/status', validate(vendorStatusSchema), adminController.updateVendorStatus);
router.put('/vendors/:id', adminController.updateVendor);
router.delete('/vendors/:id', adminController.deleteVendor);

// Service management
router.get('/services', adminController.getServices);
router.get('/services/:id', adminController.getService);
router.put('/services/:id/status', validate(serviceStatusSchema), adminController.updateServiceStatus);
router.put('/services/:id/featured', adminController.toggleServiceFeatured);
router.delete('/services/:id', adminController.deleteService);

// Category management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', validate(categorySchema), adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.put('/categories/:id/order', adminController.updateCategoryOrder);
router.post('/categories/:categoryId/subcategories', validate(subCategorySchema), adminController.createSubCategory);
router.put('/subcategories/:id', adminController.updateSubCategory);
router.delete('/subcategories/:id', adminController.deleteSubCategory);

// Homepage management
router.get('/homepage', adminController.getHomepageSections);
router.post('/homepage', validate(homepageSectionSchema), adminController.createHomepageSection);
router.put('/homepage/:id', adminController.updateHomepageSection);
router.delete('/homepage/:id', adminController.deleteHomepageSection);
router.put('/homepage/reorder', adminController.reorderHomepageSections);

// Shorts moderation
router.get('/shorts', adminController.getShorts);
router.put('/shorts/:id/approve', adminController.approveShort);
router.put('/shorts/:id/reject', adminController.rejectShort);
router.delete('/shorts/:id', adminController.deleteShort);

// Subscription pricing
router.get('/pricing', adminController.getSubscriptionPricing);
router.post('/pricing', validate(pricingSchema), adminController.createSubscriptionPricing);
router.put('/pricing/:id', adminController.updateSubscriptionPricing);
router.delete('/pricing/:id', adminController.deleteSubscriptionPricing);

// Country management
router.get('/countries', adminController.getCountries);
router.put('/countries/:code', adminController.updateCountry);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Admin logs
router.get('/logs', adminController.getLogs);

export default router;
