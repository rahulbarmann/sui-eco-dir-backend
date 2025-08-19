import AWS from 'aws-sdk';
import { createError } from '../middleware/errorHandler.js';

// Configure AWS
console.log('Configuring AWS S3...');
console.log(
  'Access Key ID:',
  process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set'
);
console.log(
  'Secret Access Key:',
  process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set'
);
console.log('Region:', process.env.AWS_REGION || 'us-east-1');
console.log('Bucket Name:', process.env.AWS_S3_BUCKET_NAME || 'Not set');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CDN_BASE_URL = process.env.CDN_BASE_URL;

if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

if (!CDN_BASE_URL) {
  throw new Error('CDN_BASE_URL environment variable is required');
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

export interface FileUploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  projectName?: string; // For project-based folder structure
}

export class S3Service {
  private static instance: S3Service;

  private constructor() {}

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      console.log('Starting S3 upload...');
      console.log('File name:', file.originalname);
      console.log('File size:', file.size, 'bytes');
      console.log('File mimetype:', file.mimetype);

      const {
        folder = 'uploads',
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize = 5 * 1024 * 1024, // 5MB default
        projectName,
      } = options;

      // Validate file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw createError(
          400,
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        throw createError(
          400,
          `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
        );
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;

      let key: string;
      if (projectName) {
        const sanitizedProjectName = projectName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-');
        key = `${sanitizedProjectName}/${folder}/${fileName}`;
      } else {
        key = `${folder}/${fileName}`;
      }

      console.log('Uploading to bucket:', BUCKET_NAME);
      console.log('Key:', key);

      const uploadParams = {
        Bucket: BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      };

      console.log('Upload params prepared, starting upload...');
      const result = await s3.upload(uploadParams).promise();
      console.log('Upload successful!');

      const cdnUrl = `${CDN_BASE_URL}/${result.Key}`;

      const uploadResult = {
        url: cdnUrl,
        key: result.Key,
        bucket: result.Bucket,
        size: file.size,
      };

      console.log('Upload completed successfully:', uploadResult);
      return uploadResult;
    } catch (error) {
      console.error('S3 upload error:', error);

      if (
        error instanceof Error &&
        (error.message.includes('Invalid file type') ||
          error.message.includes('File too large'))
      ) {
        throw error;
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const awsError = error as any;
        console.error('AWS Error Code:', awsError.code);
        console.error('AWS Error Message:', awsError.message);

        switch (awsError.code) {
          case 'NoSuchBucket':
            throw createError(500, 'S3 bucket not found');
          case 'AccessDenied':
            throw createError(500, 'Access denied to S3 bucket');
          case 'InvalidBucketName':
            throw createError(500, 'Invalid S3 bucket name');
          case 'NetworkingError':
            throw createError(500, 'Network error connecting to S3');
          default:
            throw createError(500, `S3 upload failed: ${awsError.message}`);
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw createError(500, `Failed to upload file to S3: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: BUCKET_NAME!,
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw createError(500, 'Failed to delete file from S3');
    }
  }

  /**
   * Get a signed URL for uploading (if needed for direct uploads)
   */
  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn,
      };

      return await s3.getSignedUrlPromise('putObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw createError(500, 'Failed to generate signed upload URL');
    }
  }

  /**
   * Get a signed URL for downloading (if needed for private files)
   */
  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: key,
        Expires: expiresIn,
      };

      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw createError(500, 'Failed to generate signed download URL');
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: key,
      };

      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if ((error as any).code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: key,
      };

      return await s3.headObject(params).promise();
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw createError(500, 'Failed to get file metadata from S3');
    }
  }

  /**
   * Create project folder structure in S3
   */
  async createProjectFolders(projectName: string): Promise<void> {
    try {
      console.log('Creating project folder structure for:', projectName);

      const sanitizedProjectName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');
      const folders = [
        'logo',
        'project-images',
        'project-hero-image',
        'project-videos',
      ];

      const createFolderPromises = folders.map(async folder => {
        const key = `${sanitizedProjectName}/${folder}/.gitkeep`;
        const params = {
          Bucket: BUCKET_NAME!,
          Key: key,
          Body: '',
          ContentType: 'text/plain',
        };

        try {
          await s3.upload(params).promise();
          console.log(`Created folder: ${sanitizedProjectName}/${folder}/`);
        } catch (error) {
          console.log(
            `Failed to create folder: ${sanitizedProjectName}/${folder}/`,
            error
          );
        }
      });

      await Promise.all(createFolderPromises);
      console.log('Project folder structure created successfully');
    } catch (error) {
      console.error('Error creating project folders:', error);
      throw createError(500, 'Failed to create project folder structure');
    }
  }

  /**
   * Create video-specific folder structure: <project-name>/project-videos/<playback-id>/thumbnail/
   */
  async createVideoFolder(
    projectName: string,
    playbackId: string
  ): Promise<void> {
    try {
      console.log('Creating video folder structure for:', {
        projectName,
        playbackId,
      });

      const sanitizedProjectName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');
      const sanitizedPlaybackId = playbackId
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');

      const key = `${sanitizedProjectName}/project-videos/${sanitizedPlaybackId}/thumbnail/.gitkeep`;
      const params = {
        Bucket: BUCKET_NAME!,
        Key: key,
        Body: '',
        ContentType: 'text/plain',
      };

      await s3.upload(params).promise();
      console.log(
        `Created video folder: ${sanitizedProjectName}/project-videos/${sanitizedPlaybackId}/thumbnail/`
      );
    } catch (error) {
      console.error('Error creating video folder:', error);
      throw createError(500, 'Failed to create video folder structure');
    }
  }

  /**
   * List all files in a project folder
   */
  async listProjectFiles(
    projectName: string,
    folder?: string
  ): Promise<AWS.S3.Object[]> {
    try {
      const sanitizedProjectName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');
      const prefix = folder
        ? `${sanitizedProjectName}/${folder}/`
        : `${sanitizedProjectName}/`;

      const params = {
        Bucket: BUCKET_NAME!,
        Prefix: prefix,
      };

      const result = await s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list files error:', error);
      throw createError(500, 'Failed to list project files from S3');
    }
  }
}

export default S3Service.getInstance();
