import express, { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { requireAuth } from './authRoutes.js';

const router: express.Router = express.Router();
const projectController = new ProjectController();

// GET /api/v1/projects - Get all projects with filtering and pagination
router.get('/', projectController.getProjects);

// GET /api/v1/projects/featured - Get featured projects
router.get('/featured', projectController.getFeaturedProjects);

// GET /api/v1/projects/search - Search projects
router.get('/search', projectController.searchProjects);

// GET /api/v1/projects/category/:category - Get projects by category
router.get('/category/:category', projectController.getProjectsByCategory);

// GET /api/v1/projects/:id - Get project by ID
router.get('/:id', projectController.getProjectById);

// POST /api/v1/projects - Create new project
router.post('/', requireAuth, projectController.createProject);

// PUT /api/v1/projects/:id - Update project
router.put('/:id', requireAuth, projectController.updateProject);

// DELETE /api/v1/projects/:id - Delete project
router.delete('/:id', requireAuth, projectController.deleteProject);

export { router as projectRoutes };
