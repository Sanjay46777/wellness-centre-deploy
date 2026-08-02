import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { testConnection } from './config/db';
import { setupDatabase } from './config/setup';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

import authRoutes from './routes/auth';
import counsellorRoutes from './routes/counsellors';
import feedbackRoutes from './routes/feedback';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import exportRoutes from './routes/exports';
import qrRoutes from './routes/qr';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});

// Rate limiting is a production concern; in development/test it would
// lock out the app's own e2e suites and local testing on shared IPs.
if (env.NODE_ENV === 'production') {
  app.use(limiter);
  app.use('/api/auth/login', authLimiter);
}

app.use('/api/auth', authRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/qr-code', qrRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Unable to connect to PostgreSQL database. Check your environment variables.');
    process.exit(1);
  }
  logger.info('Connected to PostgreSQL database.');

  await setupDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

start();
