import express, { Router, Request, Response } from 'express';

const router: express.Router = express.Router();

// GET /api/v1/health - Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sui Ecosystem Directory API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// GET /api/v1/health/status - Detailed status check
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

export { router as healthRoutes };
