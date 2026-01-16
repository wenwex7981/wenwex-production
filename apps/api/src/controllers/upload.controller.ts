// ===========================================
// UPLOAD CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, BadRequestError } from '../middleware/error.middleware';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const BUCKET_NAME = 'wenvex-media';

export const uploadController = {
    // Upload image
    uploadImage: asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError('No file provided');
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `images/${req.user!.id}/${uuidv4()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
            });

        if (error) {
            throw new BadRequestError(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: publicUrl.publicUrl,
                path: data.path,
                size: file.size,
                type: file.mimetype,
            },
        });
    }),

    // Upload video
    uploadVideo: asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError('No file provided');
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `videos/${req.user!.id}/${uuidv4()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
            });

        if (error) {
            throw new BadRequestError(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                url: publicUrl.publicUrl,
                path: data.path,
                size: file.size,
                type: file.mimetype,
            },
        });
    }),

    // Upload document (PDF)
    uploadDocument: asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError('No file provided');
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `documents/${req.user!.id}/${uuidv4()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
            });

        if (error) {
            throw new BadRequestError(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url: publicUrl.publicUrl,
                path: data.path,
                size: file.size,
                type: file.mimetype,
            },
        });
    }),

    // Delete file
    deleteFile: asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;

        // fileId should be the full path in the bucket
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileId]);

        if (error) {
            throw new BadRequestError(`Delete failed: ${error.message}`);
        }

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    }),
};
