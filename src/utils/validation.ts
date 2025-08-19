import { z } from 'zod';

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long'),
  categories: z
    .array(z.string())
    .min(1, 'At least one category is required')
    .max(5, 'Too many categories'),
  logo: z.string().url('Invalid logo URL').optional(),
  website: z.string().url('Invalid website URL').optional(),
  github: z.string().url('Invalid GitHub URL').optional(),
  twitter: z.string().url('Invalid Twitter URL').optional(),
  discord: z.string().url('Invalid Discord URL').optional(),
  telegram: z.string().url('Invalid Telegram URL').optional(),
  featured: z.boolean().optional().default(false),
  status: z
    .enum(['active', 'inactive', 'coming-soon'])
    .optional()
    .default('active'),
  videoUrl: z.string().url('Invalid video URL').optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  socialLinks: z
    .object({
      website: z.string().url('Invalid website URL').optional(),
      github: z.string().url('Invalid GitHub URL').optional(),
      twitter: z.string().url('Invalid Twitter URL').optional(),
      discord: z.string().url('Invalid Discord URL').optional(),
      telegram: z.string().url('Invalid Telegram URL').optional(),
      medium: z.string().url('Invalid Medium URL').optional(),
      youtube: z.string().url('Invalid YouTube URL').optional(),
    })
    .optional(),
  metrics: z
    .object({
      users: z.number().positive('Users must be positive').optional(),
      transactions: z
        .number()
        .positive('Transactions must be positive')
        .optional(),
      tvl: z.number().positive('TVL must be positive').optional(),
    })
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().min(1, 'Project ID is required'),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use hex)'),
  featured: z.boolean().optional().default(false),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
});

// Query validation schemas
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .transform((val: string) => Number(val))
    .pipe(z.number().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val: string) => Number(val))
    .pipe(z.number().min(1).max(100))
    .optional()
    .default('10'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const projectQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  featured: z
    .string()
    .transform((val: string) => val === 'true')
    .optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Validation helper function
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors.map((e: z.ZodIssue) => e.message).join(', ')}`
      );
    }
    throw error;
  }
};
