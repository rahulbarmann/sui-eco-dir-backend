import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService.js';
import {
  validateRequest,
  projectQuerySchema,
  createProjectSchema,
  updateProjectSchema,
} from '../utils/validation.js';
import {
  ProjectQuery,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/index.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        category: req.query.category as string,
        featured: req.query.featured
          ? req.query.featured === 'true'
          : undefined,
        status: req.query.status as string,
        search: req.query.search as string,
        sortBy:
          (req.query.sortBy as 'name' | 'createdAt' | 'updatedAt') ||
          'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };
      const result = await this.projectService.getProjects(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Project ID is required' });
        return;
      }
      const result = await this.projectService.getProjectById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.projectService.getFeaturedProjects();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectData = validateRequest(
        createProjectSchema,
        req.body
      ) as CreateProjectRequest;
      const result = await this.projectService.createProject(projectData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Project ID is required' });
        return;
      }
      const updateData = validateRequest(updateProjectSchema, {
        ...req.body,
        id,
      }) as UpdateProjectRequest;
      const result = await this.projectService.updateProject(id, updateData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Project ID is required' });
        return;
      }
      const result = await this.projectService.deleteProject(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProjectsByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { category } = req.params;
      if (!category) {
        res.status(400).json({ success: false, error: 'Category is required' });
        return;
      }
      const result = await this.projectService.getProjectsByCategory(category);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  searchProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required',
        });
        return;
      }
      const result = await this.projectService.searchProjects(q);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
