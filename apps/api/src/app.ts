import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from '@/config/env';
import { API_PREFIX } from '@/config/constants';
import { errorHandler } from '@/middlewares/errorHandler.middleware';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';

// ==============================
// Express App Setup
// ==============================

const app: Express = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing (for refresh tokens)
app.use(cookieParser());

// HTTP request logging (using winston stream)
app.use(
  morgan('short', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// ==============================
// Health Check
// ==============================

app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    app: 'Tokoify API',
    db: dbStatus,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get(`${API_PREFIX}/health`, async (_req, res) => {
  res.json({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// ==============================
// API Routes (will be added per module in subsequent phases)
// ==============================

// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/products`, productRoutes);
// app.use(`${API_PREFIX}/categories`, categoryRoutes);
// app.use(`${API_PREFIX}/cart`, cartRoutes);
// app.use(`${API_PREFIX}/orders`, orderRoutes);
// app.use(`${API_PREFIX}/payments`, paymentRoutes);
// app.use(`${API_PREFIX}/reviews`, reviewRoutes);
// app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
// app.use(`${API_PREFIX}/admin`, adminRoutes);

// ==============================
// 404 Handler
// ==============================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// ==============================
// Global Error Handler (must be last)
// ==============================

app.use(errorHandler);

// ==============================
// Start Server
// ==============================

const PORT = env.PORT;

async function bootstrap(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Tokoify API running on http://localhost:${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/health`);
      logger.info(`📦 API v1: http://localhost:${PORT}${API_PREFIX}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();

export default app;
