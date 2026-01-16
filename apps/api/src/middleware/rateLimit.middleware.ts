// ===========================================
// RATE LIMITING MIDDLEWARE
// ===========================================

import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for authentication
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit for uploads
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        success: false,
        error: 'Upload limit exceeded, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit for search
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        success: false,
        error: 'Search limit exceeded, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
