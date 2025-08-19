import express, { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';

const router: express.Router = Router();
const categoryController = new CategoryController();

// GET /api/v1/categories - Get all categories
router.get('/', categoryController.getCategories);

// GET /api/v1/categories/featured - Get featured categories
router.get('/featured', categoryController.getFeaturedCategories);

// GET /api/v1/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/v1/categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /api/v1/categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/v1/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

export { router as categoryRoutes };
