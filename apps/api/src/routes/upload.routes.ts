// ===========================================
// UPLOAD ROUTES
// ===========================================

import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
};

// File filter for videos
const videoFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, WebM, and MOV are allowed.'));
    }
};

// File filter for documents
const documentFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF is allowed.'));
    }
};

// Multer instances
const imageUpload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const videoUpload = multer({
    storage,
    fileFilter: videoFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const documentUpload = multer({
    storage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// All routes require authentication
router.use(authenticate);
router.use(uploadRateLimit);

// Upload routes
router.post('/image', imageUpload.single('file'), uploadController.uploadImage);
router.post('/video', videoUpload.single('file'), uploadController.uploadVideo);
router.post('/document', documentUpload.single('file'), uploadController.uploadDocument);
router.delete('/:fileId', uploadController.deleteFile);

export default router;
