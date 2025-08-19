import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService.js';
import {
  validateRequest,
  createCategorySchema,
  updateCategorySchema,
} from '../utils/validation.js';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/index.js';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.categoryService.getCategories();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Category ID is required' });
        return;
      }
      const result = await this.categoryService.getCategoryById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.categoryService.getFeaturedCategories();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryData = validateRequest(
        createCategorySchema,
        req.body
      ) as CreateCategoryRequest;
      const result = await this.categoryService.createCategory(categoryData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = validateRequest(updateCategorySchema, {
        ...req.body,
        id,
      }) as UpdateCategoryRequest;
      const result = await this.categoryService.updateCategory(id, updateData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.categoryService.deleteCategory(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
