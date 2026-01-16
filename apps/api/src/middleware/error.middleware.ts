// ===========================================
// ERROR HANDLING MIDDLEWARE
// ===========================================

import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad request') {
        super(message, 400);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409);
    }
}

export class ValidationError extends ApiError {
    errors: Record<string, string[]>;

    constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
        super(message, 422);
        this.errors = errors;
    }
}

export class InternalError extends ApiError {
    constructor(message: string = 'Internal server error') {
        super(message, 500);
    }
}

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    // Log error
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    // Handle known API errors
    if (err instanceof ApiError) {
        const response: Record<string, unknown> = {
            success: false,
            error: err.message,
        };

        if (err instanceof ValidationError) {
            response.errors = err.errors;
        }

        if (process.env.NODE_ENV === 'development') {
            response.stack = err.stack;
        }

        res.status(err.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        res.status(400).json({
            success: false,
            error: 'Database operation failed',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Token expired',
        });
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// Async handler wrapper to avoid try-catch in every route
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
