// ===========================================
// AUTHENTICATION CONTROLLER
// ===========================================

import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { asyncHandler, BadRequestError, UnauthorizedError, ConflictError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Generate JWT token
const generateToken = (user: { id: string; email: string; role: UserRole; vendorId?: string }) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendorId,
        },
        secret,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
};

export const authController = {
    // Register new user
    register: asyncHandler(async (req: Request, res: Response) => {
        const { email, password, fullName } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
        });

        if (authError) {
            throw new BadRequestError(authError.message);
        }

        // Hash password for local storage (backup)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                role: UserRole.BUYER,
                supabaseId: authData.user?.id,
            },
        });

        // Generate JWT
        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
                token,
            },
        });
    }),

    // Login
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email },
            include: { vendor: true },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedError('User not found');
        }

        // Generate JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendor?.id,
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                    vendor: user.vendor ? {
                        id: user.vendor.id,
                        companyName: user.vendor.companyName,
                        status: user.vendor.status,
                    } : null,
                },
                token,
            },
        });
    }),

    // Logout
    logout: asyncHandler(async (req: Request, res: Response) => {
        // With JWT, logout is handled client-side by removing the token
        // Optionally, we could implement a token blacklist

        res.json({
            success: true,
            message: 'Logout successful',
        });
    }),

    // Refresh token
    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) throw new Error('JWT_SECRET not configured');

        try {
            const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as any;

            // Check if user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { vendor: true },
            });

            if (!user || user.deletedAt) {
                throw new UnauthorizedError('User not found');
            }

            // Generate new token
            const newToken = generateToken({
                id: user.id,
                email: user.email,
                role: user.role,
                vendorId: user.vendor?.id,
            });

            res.json({
                success: true,
                data: { token: newToken },
            });
        } catch (error) {
            throw new UnauthorizedError('Invalid token');
        }
    }),

    // Forgot password
    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link',
            });
            return;
        }

        // Send reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.BUYER_URL}/auth/reset-password`,
        });

        if (error) {
            console.error('Password reset error:', error);
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link',
        });
    }),

    // Reset password
    resetPassword: asyncHandler(async (req: Request, res: Response) => {
        const { token, password } = req.body;

        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            throw new BadRequestError('Failed to reset password. Token may be invalid or expired.');
        }

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    }),

    // Verify email
    verifyEmail: asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.params;

        // Verify with Supabase (token is handled client-side)
        // Update user in database
        await prisma.user.updateMany({
            where: { supabaseId: token },
            data: { isEmailVerified: true },
        });

        res.json({
            success: true,
            message: 'Email verified successfully',
        });
    }),

    // Get current user
    getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: { vendor: true },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                phone: user.phone,
                country: user.country,
                isEmailVerified: user.isEmailVerified,
                vendor: user.vendor ? {
                    id: user.vendor.id,
                    companyName: user.vendor.companyName,
                    slug: user.vendor.slug,
                    status: user.vendor.status,
                    isVerified: user.vendor.isVerified,
                } : null,
                createdAt: user.createdAt,
            },
        });
    }),

    // Google OAuth
    googleAuth: asyncHandler(async (req: Request, res: Response) => {
        const { accessToken, idToken } = req.body;

        // Verify Google token with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (authError) {
            throw new UnauthorizedError('Google authentication failed');
        }

        const googleUser = authData.user;
        if (!googleUser || !googleUser.email) {
            throw new UnauthorizedError('Failed to get user info from Google');
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
            include: { vendor: true },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    fullName: googleUser.user_metadata?.full_name || googleUser.email.split('@')[0],
                    avatarUrl: googleUser.user_metadata?.avatar_url,
                    role: UserRole.BUYER,
                    supabaseId: googleUser.id,
                    isEmailVerified: true,
                },
                include: { vendor: true },
            });
        }

        // Generate JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendor?.id,
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                },
                token,
            },
        });
    }),
};
