import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { config } from './config.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { validateInput } from './middleware/safety.js';
import { logger } from './utils/logger.js';
import { connectMongo } from './db/mongo.js';

// Routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import sessionsRoutes from './routes/sessions.js';
import metricsRoutes from './routes/metrics.js';
import configRoutes from './routes/config.js';
import messagesRoutes from './routes/messages.js';

export async function createServer() {
  const app = express();

  // CORS must come before Helmet to prevent CORS headers from being stripped
  app.use(corsMiddleware);
  
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request logging
  app.use((req, res, next) => {
    const correlationId = randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    logger.info({ method: req.method, path: req.path, correlationId }, 'Request');
    next();
  });

  // Rate limiting
  app.use('/api', rateLimiter);

  // Safety validation
  app.use('/api/chat', validateInput);

  // Health check (temporary diagnostics)
  app.get('/__health', (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      userRequiredPaths: ['/api/sessions', '/api/messages', '/api/chat', '/api/config'],
    });
  });

  // Route manifest (dev only)
  if (config.env !== 'production') {
    app.get('/__routes', (req, res) => {
      // Collect known mounted routes
      const routes: Array<{ method: string; path: string }> = [];
      const collectRoutes = (router: any, prefix: string) => {
        try {
          router.stack?.forEach((layer: any) => {
            if (layer.route) {
              const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
              methods.forEach((method) => routes.push({ method, path: prefix + layer.route.path }));
            }
          });
        } catch {}
      };
      collectRoutes(authRoutes, '/api/auth');
      collectRoutes(chatRoutes, '/api/chat');
      collectRoutes(sessionsRoutes, '/api/sessions');
      collectRoutes(messagesRoutes, '/api/messages');
      collectRoutes(metricsRoutes, '/api/metrics');
      collectRoutes(configRoutes, '/api/config');
      res.json({ routes: routes.sort((a, b) => a.path.localeCompare(b.path)) });
    });
  }

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/config', configRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export async function startServer() {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Create server
    const app = await createServer();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.env }, 'Server started');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

