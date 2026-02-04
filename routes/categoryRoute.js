import { Router } from 'express';
import { authRequired, isAdmin } from '../middlewares/validateToken.js';
import { createCategory, getCategories, updateCategory, deleteCategory, getCategoriesById } from '../controllers/categoryController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);
router.put('/categories/:id', authRequired, isAdmin, updateCategory);
router.delete('/categories/:id', authRequired, isAdmin, deleteCategory);
router.post('/categories', authRequired, isAdmin, createCategory);

export default router;