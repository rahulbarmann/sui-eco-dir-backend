import {
  ProjectVideo,
  VideoQuery,
  CreateProjectVideoRequest,
  UpdateProjectVideoRequest,
  ApiResponse,
} from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import prisma from './prismaService.js';

export class VideoService {
  // Get all videos with filtering and pagination
  async getVideos(query: VideoQuery): Promise<ApiResponse<ProjectVideo[]>> {
    const {
      page = 1,
      limit = 10,
      featured,
      projectId,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: any = {};

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (category) {
      // Filter by project categories since videos inherit from projects
      where.project = {
        categories: {
          some: {
            category: { name: category },
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { playbackId: { contains: search, mode: 'insensitive' } },
        {
          project: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count for pagination
    const total = await prisma.projectVideo.count({ where });

    // Get videos with relations
    const videos = await prisma.projectVideo.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform videos for response
    const transformedVideos = videos.map(video => ({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      projectName: video.project.name,
      categories: video.project.categories.map(pc => pc.category.name),
    }));

    return {
      success: true,
      message: 'Videos retrieved successfully',
      data: transformedVideos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get videos for a specific project
  async getProjectVideos(
    projectId: string
  ): Promise<ApiResponse<ProjectVideo[]>> {
    const videos = await prisma.projectVideo.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform videos for response
    const transformedVideos = videos.map(video => ({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      projectName: video.project.name,
      categories: video.project.categories.map(pc => pc.category.name),
    }));

    return {
      success: true,
      message: 'Project videos retrieved successfully',
      data: transformedVideos,
    };
  }

  // Get a single video by ID
  async getVideoById(id: string): Promise<ApiResponse<ProjectVideo>> {
    const video = await prisma.projectVideo.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw createError(404, 'Video not found');
    }

    // Transform video for response
    const transformedVideo = {
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      projectName: video.project.name,
      categories: video.project.categories.map(pc => pc.category.name),
    };

    return {
      success: true,
      message: 'Video retrieved successfully',
      data: transformedVideo,
    };
  }

  // Get featured videos
  async getFeaturedVideos(): Promise<ApiResponse<ProjectVideo[]>> {
    const videos = await prisma.projectVideo.findMany({
      where: { featured: true },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform videos for response
    const transformedVideos = videos.map(video => ({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      projectName: video.project.name,
      categories: video.project.categories.map(pc => pc.category.name),
    }));

    return {
      success: true,
      message: 'Featured videos retrieved successfully',
      data: transformedVideos,
    };
  }

  // Create a new video
  async createVideo(
    videoData: CreateProjectVideoRequest
  ): Promise<ApiResponse<ProjectVideo>> {
    const { projectId, title, description, playbackId, thumbnail, featured } =
      videoData;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) {
      throw createError(404, 'Project not found');
    }

    // Check if playbackId already exists
    const existingVideo = await prisma.projectVideo.findUnique({
      where: { playbackId },
    });

    if (existingVideo) {
      throw createError(409, 'Video with this playback ID already exists');
    }

    // Create video - categories are inherited from project
    const newVideo = await prisma.projectVideo.create({
      data: {
        projectId,
        title,
        description,
        playbackId,
        thumbnail: thumbnail || '',
        featured: featured || false,
      },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Transform video for response
    const transformedVideo = {
      id: newVideo.id,
      projectId: newVideo.projectId,
      title: newVideo.title,
      description: newVideo.description,
      playbackId: newVideo.playbackId,
      thumbnail: newVideo.thumbnail,
      featured: newVideo.featured,
      createdAt: newVideo.createdAt.toISOString(),
      updatedAt: newVideo.updatedAt.toISOString(),
      projectName: newVideo.project.name,
      categories: newVideo.project.categories.map(pc => pc.category.name),
    };

    return {
      success: true,
      message: 'Video created successfully',
      data: transformedVideo,
    };
  }

  // Update a video
  async updateVideo(
    id: string,
    updateData: UpdateProjectVideoRequest
  ): Promise<ApiResponse<ProjectVideo>> {
    // Check if video exists
    const existingVideo = await prisma.projectVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw createError(404, 'Video not found');
    }

    // If updating playbackId, check for conflicts
    if (
      updateData.playbackId &&
      updateData.playbackId !== existingVideo.playbackId
    ) {
      const conflictingVideo = await prisma.projectVideo.findUnique({
        where: { playbackId: updateData.playbackId },
      });

      if (conflictingVideo) {
        throw createError(409, 'Video with this playback ID already exists');
      }
    }

    // Update video
    const updatedVideo = await prisma.projectVideo.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        playbackId: updateData.playbackId,
        thumbnail: updateData.thumbnail,
        featured: updateData.featured,
      },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Transform video for response
    const transformedVideo = {
      id: updatedVideo.id,
      projectId: updatedVideo.projectId,
      title: updatedVideo.title,
      description: updatedVideo.description,
      playbackId: updatedVideo.playbackId,
      thumbnail: updatedVideo.thumbnail,
      featured: updatedVideo.featured,
      createdAt: updatedVideo.createdAt.toISOString(),
      updatedAt: updatedVideo.updatedAt.toISOString(),
      projectName: updatedVideo.project.name,
      categories: updatedVideo.project.categories.map(pc => pc.category.name),
    };

    return {
      success: true,
      message: 'Video updated successfully',
      data: transformedVideo,
    };
  }

  // Delete a video
  async deleteVideo(id: string): Promise<ApiResponse<null>> {
    const video = await prisma.projectVideo.findUnique({
      where: { id },
    });

    if (!video) {
      throw createError(404, 'Video not found');
    }

    await prisma.projectVideo.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Video deleted successfully',
      data: null,
    };
  }

  // Get videos by category (inherited from projects)
  async getVideosByCategory(
    categoryName: string
  ): Promise<ApiResponse<ProjectVideo[]>> {
    const videos = await prisma.projectVideo.findMany({
      where: {
        project: {
          categories: {
            some: {
              category: { name: categoryName },
            },
          },
        },
      },
      include: {
        project: {
          select: {
            name: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform videos for response
    const transformedVideos = videos.map(video => ({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      projectName: video.project.name,
      categories: video.project.categories.map(pc => pc.category.name),
    }));

    return {
      success: true,
      message: `Videos for category '${categoryName}' retrieved successfully`,
      data: transformedVideos,
    };
  }
}

export default new VideoService();
