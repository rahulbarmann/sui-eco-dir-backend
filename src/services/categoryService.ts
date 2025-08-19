import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
} from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import prisma from './prismaService.js';

export class CategoryService {
  // Get all categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const transformedCategories: Category[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      projectCount: category.projectCount,
      featured: category.featured,
    }));

    return {
      success: true,
      data: transformedCategories,
    };
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw createError('404', 'Category not found');
    }

    const transformedCategory: Category = {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      projectCount: category.projectCount,
      featured: category.featured,
    };

    return {
      success: true,
      data: transformedCategory,
    };
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<ApiResponse<Category[]>> {
    const categories = await prisma.category.findMany({
      where: { featured: true },
      orderBy: { name: 'asc' },
    });

    const transformedCategories: Category[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      projectCount: category.projectCount,
      featured: category.featured,
    }));

    return {
      success: true,
      data: transformedCategories,
    };
  }

  // Create new category
  async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        featured: categoryData.featured ?? false,
      },
    });

    const transformedCategory: Category = {
      id: newCategory.id,
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      projectCount: newCategory.projectCount,
      featured: newCategory.featured,
    };

    return {
      success: true,
      data: transformedCategory,
      message: 'Category created successfully',
    };
  }

  // Update category
  async updateCategory(
    id: string,
    updateData: UpdateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw createError('404', 'Category not found');
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        icon: updateData.icon,
        featured: updateData.featured,
      },
    });

    const transformedCategory: Category = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      icon: updatedCategory.icon,
      projectCount: updatedCategory.projectCount,
      featured: updatedCategory.featured,
    };

    return {
      success: true,
      data: transformedCategory,
      message: 'Category updated successfully',
    };
  }

  // Delete category
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { projects: true },
    });

    if (!category) {
      throw createError('404', 'Category not found');
    }

    if (category.projects.length > 0) {
      throw createError('400', 'Cannot delete category with existing projects');
    }

    await prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
