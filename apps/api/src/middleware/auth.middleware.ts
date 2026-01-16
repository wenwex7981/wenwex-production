// ===========================================
// AUTHENTICATION MIDDLEWARE
// ===========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from './error.middleware';

const prisma = new PrismaClient();

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
                vendorId?: string;
            };
        }
    }
}

interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    vendorId?: string;
}

// Verify JWT token and attach user to request
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { vendor: true },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedError('User not found');
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendor?.id,
        };

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { vendor: true },
            });

            if (user && !user.deletedAt) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    vendorId: user.vendor?.id,
                };
            }
        } catch {
            // Ignore token errors for optional auth
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Role-based authorization
export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`)
            );
        }

        next();
    };
};

// Check if user is a vendor
export const isVendor = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== UserRole.VENDOR && req.user.role !== UserRole.SUPER_ADMIN) {
        return next(new ForbiddenError('Vendor access required'));
    }

    if (req.user.role === UserRole.VENDOR && !req.user.vendorId) {
        return next(new ForbiddenError('Vendor profile required'));
    }

    next();
};

// Check if user is super admin
export const isSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
        return next(new ForbiddenError('Super admin access required'));
    }

    next();
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (getOwnerId: (req: Request) => string | undefined) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (req.user.role === UserRole.SUPER_ADMIN) {
            return next();
        }

        const ownerId = getOwnerId(req);
        if (ownerId !== req.user.id && ownerId !== req.user.vendorId) {
            return next(new ForbiddenError('You do not have permission to access this resource'));
        }

        next();
    };
};
