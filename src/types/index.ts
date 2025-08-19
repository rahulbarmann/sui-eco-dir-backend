// Project types
export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  heroImage: string | null;
  website: string | null;
  videoUrl: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'unpublished';
  isHiring: boolean;
  careerPageUrl: string | null;
  isOpenForBounty: boolean;
  bountySubmissionUrl: string | null;
  isOpenSource: boolean;
  githubUrl: string | null;

  images: string[];
  videos?: ProjectVideo[];
  socialLinks?: {
    website: string | null;
    github: string | null;
    twitter: string | null;
    discord: string | null;
    telegram: string | null;
    medium: string | null;
    youtube: string | null;
  };
}

// Video types
export interface ProjectVideo {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  playbackId: string;
  thumbnail: string;
  featured: boolean;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
  featured: boolean;
}

// Request types
export interface CreateProjectRequest {
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  logo?: string;
  heroImage?: string;
  website?: string;
  videoUrl?: string;
  featured?: boolean;
  status?: 'published' | 'unpublished';
  isHiring?: boolean;
  careerPageUrl?: string;
  isOpenForBounty?: boolean;
  bountySubmissionUrl?: string;
  isOpenSource?: boolean;
  githubUrl?: string;

  images?: string[];
  videos?: CreateProjectVideoRequest[];
  socialLinks?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    medium?: string;
    youtube?: string;
  };
}

export interface UpdateProjectRequest {
  name?: string;
  tagline?: string;
  description?: string;
  categories?: string[];
  logo?: string;
  heroImage?: string;
  website?: string;
  videoUrl?: string;
  featured?: boolean;
  status?: 'published' | 'unpublished';
  isHiring?: boolean;
  careerPageUrl?: string;
  isOpenForBounty?: boolean;
  bountySubmissionUrl?: string;
  isOpenSource?: boolean;
  githubUrl?: string;
  images?: string[];
  videos?: CreateProjectVideoRequest[];
  socialLinks?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    medium?: string;
    youtube?: string;
  };
}

export interface CreateProjectVideoRequest {
  projectId: string;
  title: string;
  description?: string;
  playbackId: string;
  thumbnail?: string;
  featured?: boolean;
}

export interface UpdateProjectVideoRequest {
  title?: string;
  description?: string;
  playbackId?: string;
  thumbnail?: string;
  featured?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  icon: string;
  featured?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  featured?: boolean;
}

// Query types
export interface ProjectQuery {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  status?: string;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface VideoQuery {
  page?: number;
  limit?: number;
  featured?: boolean;
  projectId?: string;
  category?: string;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'order';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
