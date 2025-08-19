import express from 'express';
import prisma from '../services/prismaService.js';
import { ProjectService } from '../services/projectService.js';

const router = express.Router();
const projectService = new ProjectService();

// Dashboard stats endpoint
router.get(
  '/dashboard',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      console.log('Fetching dashboard stats from database...');

      // Get counts from database
      const [
        totalProjects,
        activeProjects,
        totalVideos,
        recentProjects,
        topCategories,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: 'PUBLISHED' } }),
        prisma.projectVideo.count(),
        prisma.project.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            socialLinks: true,
          },
        }),
        prisma.category.findMany({
          take: 5,
          orderBy: { projectCount: 'desc' },
        }),
      ]);

      console.log('Database results:', {
        totalProjects,
        activeProjects,
        totalVideos,
        recentProjectsCount: recentProjects.length,
        topCategoriesCount: topCategories.length,
        firstProject: recentProjects[0]?.name,
        firstCategory: topCategories[0]?.name,
      });

      res.json({
        success: true,
        data: {
          debug: 'USING_DATABASE_QUERIES_V2',
          test: 'THIS_IS_A_TEST',
          totalProjects,
          activeProjects,
          totalCategories: await prisma.category.count(),
          totalVideos,
          recentProjects: recentProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            categories: project.categories.map(pc => pc.category.name),
            website: project.socialLinks?.website || '',
            twitter: project.socialLinks?.twitter || '',
            github: project.socialLinks?.github || '',
            logo: project.logo || '',
            banner: '', // Not in schema, using empty string
            featured: project.featured,
            status:
              project.status === 'PUBLISHED' ? 'published' : 'unpublished',
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
          })),
          topCategories: topCategories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: '#3B82F6', // Default color since not in schema
            projectCount: category.projectCount,
            createdAt: category.createdAt.toISOString(),
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard stats',
      });
    }
  }
);

router.get(
  '/projects',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const category = req.query.category as string;

      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (status && status !== 'all') {
        if (status === 'active') {
          where.status = 'ACTIVE';
        } else if (status === 'inactive' || status === 'pending') {
          where.status = 'INACTIVE';
        } else if (status === 'coming-soon') {
          where.status = 'COMING_SOON';
        }
      }
      if (category) {
        where.categories = {
          some: {
            category: { name: { contains: category, mode: 'insensitive' } },
          },
        };
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          skip,
          take: limit,
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
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          projects: projects.map(project => ({
            id: project.id,
            name: project.name,
            tagline: (project as any).tagline || '',
            description: project.description,
            categories: project.categories.map(pc => pc.category.name),
            status: project.status,
            featured: project.featured,
            website: project.socialLinks?.website || '',
            twitter: project.socialLinks?.twitter || '',
            github: project.socialLinks?.github || '',
            logo: project.logo || '',
            heroImage: (project as any).heroImage || '',
            images: project.images.map(img => img.url),
            isHiring: (project as any).isHiring || false,
            careerPageUrl: (project as any).careerPageUrl || null,
            isOpenForBounty: (project as any).isOpenForBounty || false,
            bountySubmissionUrl: (project as any).bountySubmissionUrl || null,
            isOpenSource: (project as any).isOpenSource || false,
            githubUrl: (project as any).githubUrl || null,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects',
      });
    }
  }
);

router.get(
  '/projects/:id',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;

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
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: project.id,
          name: project.name,
          tagline: (project as any).tagline || '',
          description: project.description,
          categories: project.categories.map(pc => pc.category.name),
          status: project.status,
          featured: project.featured,
          website: project.socialLinks?.website || '',
          twitter: project.socialLinks?.twitter || '',
          github: project.socialLinks?.github || '',
          logo: project.logo || '',
          heroImage: (project as any).heroImage || '',
          images: project.images.map(img => img.url),
          isHiring: (project as any).isHiring || false,
          careerPageUrl: (project as any).careerPageUrl || null,
          isOpenForBounty: (project as any).isOpenForBounty || false,
          bountySubmissionUrl: (project as any).bountySubmissionUrl || null,
          isOpenSource: (project as any).isOpenSource || false,
          githubUrl: (project as any).githubUrl || null,
          videos: project.videos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            playbackId: video.playbackId,
            thumbnail: video.thumbnail,
            featured: video.featured,
            createdAt: video.createdAt.toISOString(),
          })),
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project',
      });
    }
  }
);

router.post(
  '/projects',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      console.log('Creating project with data:', req.body);

      const {
        name,
        tagline,
        description,
        categories,
        website,
        logo,
        heroImage,
        featured = false,
        status = 'PUBLISHED',

        isHiring = false,
        careerPageUrl,
        isOpenForBounty = false,
        bountySubmissionUrl,
        isOpenSource = false,
        githubUrl,

        projectImages = [],

        socialLinks = {},
      } = req.body;

      const projectData = {
        name,
        tagline: tagline || '',
        description: description || '',
        categories,
        website,
        logo,
        heroImage,
        featured,
        status,

        isHiring,
        careerPageUrl,
        isOpenForBounty,
        bountySubmissionUrl,
        isOpenSource,
        githubUrl,

        images: projectImages,

        socialLinks,
      };

      const result = await projectService.createProject(projectData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
      });
    }
  }
);

router.put(
  '/projects/:id',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatePayload = req.body;

      const existingProject = await prisma.project.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!existingProject) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      const result = await projectService.updateProject(id, updatePayload);

      res.json(result);
      return;
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project',
      });
    }
  }
);

router.delete(
  '/projects/:id',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;

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
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      await prisma.project.delete({
        where: { id },
      });

      await Promise.all(
        project.categories.map(pc =>
          prisma.category.update({
            where: { id: pc.category.id },
            data: {
              projectCount: {
                decrement: 1,
              },
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project',
      });
    }
  }
);

router.get(
  '/categories',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: '#3B82F6', // Default color
          projectCount: category.projectCount,
          createdAt: category.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }
);

router.get(
  '/videos',
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const projectId = req.query.projectId as string;

      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (projectId) {
        where.projectId = projectId;
      }

      const [videos, total] = await Promise.all([
        prisma.projectVideo.findMany({
          skip,
          take: limit,
          where,
          include: {
            project: {
              select: {
                id: true,
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
        }),
        prisma.projectVideo.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          videos: videos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            playbackId: video.playbackId,
            thumbnail: video.thumbnail,
            projectId: video.projectId,
            projectName: video.project.name,
            featured: video.featured,
            categories: video.project.categories.map(pc => pc.category.name),
            createdAt: video.createdAt.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch videos',
      });
    }
  }
);

router.post('/upload', (req: express.Request, res: express.Response): void => {
  res.json({
    success: true,
    data: {
      url: '/uploads/mock-file.png',
    },
  });
});

export { router as adminRoutes };
