// ===========================================
// HOMEPAGE ROUTES
// ===========================================

import { Router } from 'express';
import { homepageController } from '../controllers/homepage.controller';

const router = Router();

// All routes are public
router.get('/sections', homepageController.getSections);
router.get('/featured', homepageController.getFeaturedServices);
router.get('/categories', homepageController.getCategories);
router.get('/top-agencies', homepageController.getTopAgencies);
router.get('/trending', homepageController.getTrendingServices);
router.get('/academic', homepageController.getAcademicSpotlight);
router.get('/shorts', homepageController.getShortsPreview);

export default router;
