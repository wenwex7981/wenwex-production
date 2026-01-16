// ===========================================
// WENVEX API SERVER - MAIN ENTRY POINT
// ===========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vendorRoutes from './routes/vendor.routes';
import serviceRoutes from './routes/service.routes';
import categoryRoutes from './routes/category.routes';
import shortRoutes from './routes/short.routes';
import subscriptionRoutes from './routes/subscription.routes';
import homepageRoutes from './routes/homepage.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// Initialize Express app
const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// API ROUTES
// ===========================================

const API_PREFIX = '/api/v1';

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'WENVEX API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// API documentation redirect
app.get('/api/docs', (req, res) => {
    res.json({
        message: 'WENVEX API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: `${API_PREFIX}/auth`,
            users: `${API_PREFIX}/users`,
            vendors: `${API_PREFIX}/vendors`,
            services: `${API_PREFIX}/services`,
            categories: `${API_PREFIX}/categories`,
            shorts: `${API_PREFIX}/shorts`,
            subscriptions: `${API_PREFIX}/subscriptions`,
            homepage: `${API_PREFIX}/homepage`,
            search: `${API_PREFIX}/search`,
            upload: `${API_PREFIX}/upload`,
            admin: `${API_PREFIX}/admin`,
        },
    });
});

// Mount routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/vendors`, vendorRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/shorts`, shortRoutes);
app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);
app.use(`${API_PREFIX}/homepage`, homepageRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 WENVEX API Server                                    ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port: ${PORT}                                              ║
║   API: http://localhost:${PORT}/api/v1                       ║
║   Health: http://localhost:${PORT}/health                    ║
║                                                           ║
║   © Project Genie Tech Solutions                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
