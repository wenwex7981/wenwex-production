// ===========================================
// SEARCH ROUTES
// ===========================================

import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { searchRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// All routes are public with rate limiting
router.get('/', searchRateLimit, searchController.globalSearch);
router.get('/services', searchRateLimit, searchController.searchServices);
router.get('/vendors', searchRateLimit, searchController.searchVendors);
router.get('/suggestions', searchRateLimit, searchController.getSuggestions);

export default router;
