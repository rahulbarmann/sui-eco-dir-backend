import express, { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/uploadController.js';

const router: express.Router = Router();
const uploadController = new UploadController();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files
  },
});

// Single file upload
router.post(
  '/single',
  upload.single('file'),
  uploadController.uploadFile.bind(uploadController)
);

// Multiple files upload
router.post(
  '/multiple',
  upload.array('files', 10),
  uploadController.uploadMultipleFiles.bind(uploadController)
);

// Delete file
router.delete('/:key', uploadController.deleteFile.bind(uploadController));

// Get file metadata
router.get(
  '/metadata/:key',
  uploadController.getFileMetadata.bind(uploadController)
);

// Get signed upload URL
router.post(
  '/signed-url',
  uploadController.getSignedUploadUrl.bind(uploadController)
);

// Create project folder structure
router.post(
  '/project/create-folders',
  uploadController.createProjectFolders.bind(uploadController)
);

// List project files
router.get(
  '/project/:projectName/files',
  uploadController.listProjectFiles.bind(uploadController)
);

// Create video folder structure
router.post(
  '/video/create-folder',
  uploadController.createVideoFolder.bind(uploadController)
);

// Health check
router.get('/health', uploadController.healthCheck.bind(uploadController));

export { router as uploadRoutes };
