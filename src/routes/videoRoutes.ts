import express, { Router } from 'express';
import { VideoController } from '../controllers/videoController.js';
import { requireAuth } from './authRoutes.js';

const router: express.Router = Router();
const videoController = new VideoController();

// Public routes (for frontend)
router.get('/', videoController.getVideos.bind(videoController));
router.get(
  '/featured',
  videoController.getFeaturedVideos.bind(videoController)
);
router.get('/search', videoController.searchVideos.bind(videoController));
router.get(
  '/project/:projectId',
  videoController.getVideosByProject.bind(videoController)
);
router.get('/:id', videoController.getVideoById.bind(videoController));

// Admin routes (for admin frontend)
router.post(
  '/project/:projectId',
  requireAuth,
  videoController.createVideo.bind(videoController)
);
router.put(
  '/:id',
  requireAuth,
  videoController.updateVideo.bind(videoController)
);
router.delete(
  '/:id',
  requireAuth,
  videoController.deleteVideo.bind(videoController)
);

export { router as videoRoutes };
