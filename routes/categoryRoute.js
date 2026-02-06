import { Router } from 'express';
import { authRequired, isAdmin } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema.js';
import { createCategory, getCategories, updateCategory, deleteCategory, getCategoriesById } from '../controllers/categoryController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);
router.post('/categories', authRequired, isAdmin, validateSchema(createCategorySchema), createCategory);
router.put('/categories/:id', authRequired, isAdmin, validateSchema(updateCategorySchema), updateCategory);
router.delete('/categories/:id', authRequired, isAdmin, deleteCategory);

export default router;