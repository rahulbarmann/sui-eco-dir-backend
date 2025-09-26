import express, { Router } from 'express';
import { z } from 'zod';
import prisma from '../services/prismaService.js';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';

const router: express.Router = express.Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(payload: { id: string; role: string; username: string }) {
  const secret: Secret = (process.env.JWT_SECRET ||
    'dev-secret-change-me') as Secret;
  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const options: SignOptions = { expiresIn: expiresInEnv as any };
  return jwt.sign(payload, secret, options);
}

function verifyToken(token: string) {
  const secret: Secret = (process.env.JWT_SECRET ||
    'dev-secret-change-me') as Secret;
  return jwt.verify(token, secret) as {
    id: string;
    role: string;
    username: string;
    iat: number;
    exp: number;
  };
}

export function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// Login endpoint
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token,
      },
    });
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
router.get(
  '/me',
  requireAuth,
  async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  }
);

export { router as authRoutes };
