// ===========================================
// 404 NOT FOUND MIDDLEWARE
// ===========================================

import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`,
        path: req.path,
        method: req.method,
    });
};
