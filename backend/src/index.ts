import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// Import configuration and middleware
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import emergencyRoutes from './routes/emergency';
import locationRoutes from './routes/location';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import carrierRoutes from './routes/carrier';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

// Initialize Sentry for error monitoring
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });
}

const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for Indian domains
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Rate limiting for security
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Health check route (no auth required)
app.use('/api/v1/health', healthRoutes);

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/v1/emergency', authMiddleware, emergencyRoutes);
app.use('/api/v1/location', authMiddleware, locationRoutes);
app.use('/api/v1/user', authMiddleware, userRoutes);
app.use('/api/v1/admin', authMiddleware, adminRoutes);
app.use('/api/v1/carrier', carrierRoutes); // Carrier webhooks don't need user auth

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Safe Map API - Women\'s Safety Platform for India',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
  });
});

// Global error handler
app.use(errorHandler);

// Socket.IO for real-time emergency communication
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join emergency room for real-time updates
  socket.on('join-emergency', (emergencyId: string) => {
    socket.join(`emergency-${emergencyId}`);
    logger.info(`Client ${socket.id} joined emergency room: ${emergencyId}`);
  });

  // Handle location updates
  socket.on('location-update', (data) => {
    socket.to(`emergency-${data.emergencyId}`).emit('location-update', data);
  });

  // Handle emergency status updates
  socket.on('emergency-status', (data) => {
    socket.to(`emergency-${data.emergencyId}`).emit('emergency-status', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
app.set('io', io);

const PORT = process.env.PORT || 3000;

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 Safe Map API server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
    logger.info(`⚡ Real-time: Socket.IO enabled`);
  });
}

export { app, server, io }; 