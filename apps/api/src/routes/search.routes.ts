// ===========================================
// SEARCH ROUTES
// ===========================================

import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { searchLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// All routes are public with rate limiting
router.get('/', searchLimiter, searchController.globalSearch);
router.get('/services', searchLimiter, searchController.searchServices);
router.get('/vendors', searchLimiter, searchController.searchVendors);
router.get('/suggestions', searchLimiter, searchController.getSuggestions);

export default router;
