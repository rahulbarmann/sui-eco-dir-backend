import { Request, Response } from 'express';
import { VideoService } from '../services/videoService.js';
import {
  VideoQuery,
  CreateProjectVideoRequest,
  UpdateProjectVideoRequest,
} from '../types/index.js';

export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  // Get all videos
  async getVideos(req: Request, res: Response): Promise<void> {
    try {
      const query: VideoQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        featured:
          req.query.featured === 'true'
            ? true
            : req.query.featured === 'false'
              ? false
              : undefined,
        projectId: req.query.projectId as string,
        category: req.query.category as string,
        search: req.query.search as string,
        sortBy:
          (req.query.sortBy as 'title' | 'createdAt' | 'order') || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.videoService.getVideos(query);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Get video by ID
  async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: 'Video ID is required' });
        return;
      }

      const result = await this.videoService.getVideoById(id);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Get featured videos
  async getFeaturedVideos(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.videoService.getFeaturedVideos();
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Get videos by project
  async getVideosByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        res
          .status(400)
          .json({ success: false, error: 'Project ID is required' });
        return;
      }

      const result = await this.videoService.getProjectVideos(projectId);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Create new video
  async createVideo(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        res
          .status(400)
          .json({ success: false, error: 'Project ID is required' });
        return;
      }

      const videoData: CreateProjectVideoRequest = {
        ...req.body,
        projectId,
      };
      const result = await this.videoService.createVideo(videoData);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Update video
  async updateVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: 'Video ID is required' });
        return;
      }

      const updateData: UpdateProjectVideoRequest = req.body;
      const result = await this.videoService.updateVideo(id, updateData);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Delete video
  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: 'Video ID is required' });
        return;
      }

      const result = await this.videoService.deleteVideo(id);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  // Search videos
  async searchVideos(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res
          .status(400)
          .json({ success: false, error: 'Search query is required' });
        return;
      }

      const result = await this.videoService.getVideos({ search: q });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}
