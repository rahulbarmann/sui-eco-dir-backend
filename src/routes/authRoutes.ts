import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Default admin credentials (in production, these should be in a database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  id: '1',
  role: 'admin' as const,
};

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Login endpoint
router.post('/login', (req: express.Request, res: express.Response): void => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Check credentials
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // In a real app, you'd generate a JWT token here
      const token = 'mock-jwt-token-' + Date.now();

      res.json({
        success: true,
        data: {
          user: {
            id: ADMIN_CREDENTIALS.id,
            username: ADMIN_CREDENTIALS.username,
            role: ADMIN_CREDENTIALS.role,
          },
          token,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
});

// Logout endpoint
router.post('/logout', (req: express.Request, res: express.Response): void => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Get current user endpoint
router.get('/me', (req: express.Request, res: express.Response): void => {
  // In a real app, you'd verify the JWT token here
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided',
    });
    return;
  }

  // For now, just return the admin user
  res.json({
    success: true,
    data: {
      id: ADMIN_CREDENTIALS.id,
      username: ADMIN_CREDENTIALS.username,
      role: ADMIN_CREDENTIALS.role,
    },
  });
});

export { router as authRoutes };
