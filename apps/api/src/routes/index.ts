// ===========================================
// MAIN ROUTES INDEX
// ===========================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import serviceRoutes from './service.routes';
import categoryRoutes from './category.routes';
import shortRoutes from './short.routes';
import subscriptionRoutes from './subscription.routes';
import homepageRoutes from './homepage.routes';
import searchRoutes from './search.routes';
import uploadRoutes from './upload.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);
router.use('/shorts', shortRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/homepage', homepageRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
