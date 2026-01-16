// ===========================================
// CATEGORY ROUTES
// ===========================================

import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

// All routes are public
router.get('/', categoryController.getCategories);
router.get('/it-tech', categoryController.getITTechCategories);
router.get('/academic', categoryController.getAcademicCategories);
router.get('/:idOrSlug', categoryController.getCategory);
router.get('/:idOrSlug/subcategories', categoryController.getSubCategories);

export default router;
