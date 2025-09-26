import {
  Project,
  ProjectQuery,
  CreateProjectRequest,
  UpdateProjectRequest,
  ApiResponse,
} from '../types/index.js';
import {
  Prisma,
  Project as PrismaProject,
  ProjectVideo as PrismaProjectVideo,
  ProjectStatus,
} from '@prisma/client';
import { createError } from '../middleware/errorHandler.js';
import prisma from './prismaService.js';

const mapStatus = (status: ProjectStatus): 'published' | 'unpublished' => {
  switch (status) {
    case ProjectStatus.PUBLISHED:
      return 'published';
    case ProjectStatus.UNPUBLISHED:
      return 'unpublished';
    default:
      return 'unpublished';
  }
};

const mapStatusToDb = (status: string): ProjectStatus => {
  if (!status) return ProjectStatus.UNPUBLISHED;
  const normalized = String(status).toUpperCase();
  if (normalized === 'PUBLISHED') return ProjectStatus.PUBLISHED;
  if (normalized === 'UNPUBLISHED') return ProjectStatus.UNPUBLISHED;
  if (status === 'published') return ProjectStatus.PUBLISHED;
  if (status === 'unpublished') return ProjectStatus.UNPUBLISHED;
  return ProjectStatus.UNPUBLISHED;
};

const transformProjectForResponse = (project: any): Project => ({
  id: project.id,
  name: project.name,
  tagline: project.tagline || '',
  description: project.description || '',
  logo: project.logo,
  heroImage: project.heroImage,
  website: project.website,
  videoUrl: project.videoUrl,
  featured: project.featured,
  status: mapStatus(project.status),
  isHiring: project.isHiring || false,
  careerPageUrl: project.careerPageUrl,
  isOpenForBounty: project.isOpenForBounty || false,
  bountySubmissionUrl: project.bountySubmissionUrl,
  isOpenSource: project.isOpenSource || false,
  githubUrl: project.githubUrl,

  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
  categories: project.categories.map((pc: any) => pc.category.name),
  images: project.images.map((img: any) => img.url),
  videos:
    project.videos?.map((video: any) => ({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      playbackId: video.playbackId,
      thumbnail: video.thumbnail,
      featured: video.featured,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    })) || [],
  socialLinks: project.socialLinks
    ? {
        website: project.socialLinks.website || null,
        github: project.socialLinks.github || null,
        twitter: project.socialLinks.twitter || null,
        discord: project.socialLinks.discord || null,
        telegram: project.socialLinks.telegram || null,
        medium: project.socialLinks.medium || null,
        youtube: project.socialLinks.youtube || null,
      }
    : undefined,
});

export class ProjectService {
  async getProjects(query: ProjectQuery): Promise<ApiResponse<Project[]>> {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProjectWhereInput = {};

    if (category) {
      where.categories = {
        some: {
          category: { name: category },
        },
      } as any;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (status) {
      where.status = mapStatusToDb(status);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          categories: {
            some: {
              category: { name: { contains: search, mode: 'insensitive' } },
            },
          } as any,
        },
      ];
    }

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const total = await prisma.project.count({ where });

    const projects = await prisma.project.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const transformedProjects = projects.map(transformProjectForResponse);

    return {
      success: true,
      message: 'Projects retrieved successfully',
      data: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
    });

    if (!project) {
      throw createError('404', 'Project not found');
    }

    const transformedProject = transformProjectForResponse(project);

    return {
      success: true,
      message: 'Project retrieved successfully',
      data: transformedProject,
    };
  }

  async getFeaturedProjects(): Promise<ApiResponse<Project[]>> {
    const projects = await prisma.project.findMany({
      where: { featured: true },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
    });

    const transformedProjects = projects.map(transformProjectForResponse);

    return {
      success: true,
      message: 'Featured projects retrieved successfully',
      data: transformedProjects,
    };
  }

  async createProject(
    projectData: CreateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const {
      name,
      tagline,
      description,
      categories,
      website,
      logo,
      heroImage,
      videoUrl,
      featured,
      status,
      isHiring,
      careerPageUrl,
      isOpenForBounty,
      bountySubmissionUrl,
      isOpenSource,
      githubUrl,
      images,
      socialLinks,
    } = projectData;

    if (projectData.featured) {
      const featuredCount = await prisma.project.count({
        where: { featured: true },
      });
      if (featuredCount >= 3) {
        throw createError(
          400,
          'Maximum of 3 featured projects allowed. Unfeature an existing project first.'
        );
      }
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        tagline: tagline || '',
        description: description || '',
        logo,
        heroImage,
        website,
        videoUrl,
        featured: featured || false,
        status: status ? mapStatusToDb(status) : ProjectStatus.UNPUBLISHED,

        isHiring: isHiring || false,
        careerPageUrl,
        isOpenForBounty: isOpenForBounty || false,
        bountySubmissionUrl,
        isOpenSource: isOpenSource || false,
        githubUrl,
        categories: {
          create: categories.map(categoryName => ({
            category: {
              connect: { name: categoryName },
            },
          })) as any,
        },
        socialLinks: socialLinks
          ? {
              create: {
                website: socialLinks.website || null,
                github: socialLinks.github || null,
                twitter: socialLinks.twitter || null,
                discord: socialLinks.discord || null,
                telegram: socialLinks.telegram || null,
                medium: socialLinks.medium || null,
                youtube: socialLinks.youtube || null,
              },
            }
          : undefined,
        images:
          images && images.length > 0
            ? {
                create: images.map((imageUrl, index) => ({
                  url: imageUrl,
                  alt: `Project image ${index + 1}`,
                  order: index,
                })),
              }
            : undefined,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: true,
        videos: true,
      },
    });

    const transformedProject = transformProjectForResponse(newProject);

    return {
      success: true,
      message: 'Project created successfully',
      data: transformedProject,
    };
  }

  async updateProject(
    id: string,
    updateData: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!existingProject) {
      throw createError('404', 'Project not found');
    }

    // Enforce featured limit: only allow setting to featured if there are < 3 or it was already featured
    if (
      typeof updateData.featured === 'boolean' &&
      updateData.featured === true &&
      !existingProject.featured
    ) {
      const featuredCount = await prisma.project.count({
        where: { featured: true },
      });
      if (featuredCount >= 3) {
        throw createError(
          400,
          'Maximum of 3 featured projects allowed. Unfeature an existing project first.'
        );
      }
    }

    if (updateData.categories) {
      const currentCategoryIds = existingProject.categories.map(
        pc => pc.categoryId
      );

      const newCategoryIds = await Promise.all(
        updateData.categories.map(async categoryName => {
          const category = await prisma.category.findUnique({
            where: { name: categoryName },
          });
          return category?.id;
        })
      );

      const categoriesToRemove = currentCategoryIds.filter(
        id => !newCategoryIds.includes(id)
      );

      if (categoriesToRemove.length > 0) {
        await prisma.projectCategory.deleteMany({
          where: {
            projectId: id,
            categoryId: {
              in: categoriesToRemove,
            },
          },
        });
      }

      await Promise.all(
        updateData.categories.map(async categoryName => {
          const category = await prisma.category.findUnique({
            where: { name: categoryName },
          });
          if (category) {
            await prisma.projectCategory.upsert({
              where: {
                projectId_categoryId: {
                  projectId: id,
                  categoryId: category.id,
                },
              },
              create: {
                projectId: id,
                categoryId: category.id,
              },
              update: {},
            });
          }
        })
      );
    }

    if (updateData.socialLinks) {
      await prisma.socialLinks.upsert({
        where: { projectId: id },
        create: {
          projectId: id,
          website: updateData.socialLinks.website || null,
          github: updateData.socialLinks.github || null,
          twitter: updateData.socialLinks.twitter || null,
          discord: updateData.socialLinks.discord || null,
          telegram: updateData.socialLinks.telegram || null,
          medium: updateData.socialLinks.medium || null,
          youtube: updateData.socialLinks.youtube || null,
        },
        update: {
          website: updateData.socialLinks.website || null,
          github: updateData.socialLinks.github || null,
          twitter: updateData.socialLinks.twitter || null,
          discord: updateData.socialLinks.discord || null,
          telegram: updateData.socialLinks.telegram || null,
          medium: updateData.socialLinks.medium || null,
          youtube: updateData.socialLinks.youtube || null,
        },
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: updateData.name,
        tagline: updateData.tagline,
        description: updateData.description,
        logo: updateData.logo,
        heroImage: (updateData as any).heroImage,
        website: updateData.website,
        videoUrl: updateData.videoUrl,
        featured: updateData.featured,
        status: updateData.status
          ? mapStatusToDb(updateData.status)
          : undefined,
        isHiring: (updateData as any).isHiring,
        careerPageUrl: (updateData as any).careerPageUrl,
        isOpenForBounty: (updateData as any).isOpenForBounty,
        bountySubmissionUrl: (updateData as any).bountySubmissionUrl,
        isOpenSource: (updateData as any).isOpenSource,
        githubUrl: (updateData as any).githubUrl,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
    });

    const transformedProject = transformProjectForResponse(updatedProject);

    return {
      success: true,
      message: 'Project updated successfully',
      data: transformedProject,
    };
  }

  async deleteProject(id: string): Promise<ApiResponse<null>> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!project) {
      throw createError('404', 'Project not found');
    }

    await prisma.project.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Project deleted successfully',
      data: null,
    };
  }

  async getProjectsByCategory(
    categoryName: string
  ): Promise<ApiResponse<Project[]>> {
    const projects = await prisma.project.findMany({
      where: {
        categories: {
          some: {
            category: { name: categoryName },
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
    });

    const transformedProjects = projects.map(transformProjectForResponse);

    return {
      success: true,
      message: 'Projects retrieved successfully',
      data: transformedProjects,
    };
  }

  async searchProjects(searchTerm: string): Promise<ApiResponse<Project[]>> {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          {
            categories: {
              some: {
                category: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        socialLinks: true,
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { createdAt: 'desc' },
        },
      } as const,
    });

    const transformedProjects = projects.map(transformProjectForResponse);

    return {
      success: true,
      message: 'Projects retrieved successfully',
      data: transformedProjects,
    };
  }
}
