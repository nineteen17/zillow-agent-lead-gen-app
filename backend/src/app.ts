import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { auth } from './config/auth.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Import controllers
import propertyController from './controllers/property.controller.js';
import valuationController from './controllers/valuation.controller.js';
import suburbController from './controllers/suburb.controller.js';
import leadController from './controllers/lead.controller.js';
import agentController from './controllers/agent.controller.js';
import agentSignupController from './controllers/agentSignup.controller.js';
import adminController from './controllers/admin.controller.js';
import stripeController from './controllers/stripe.controller.js';
import emailSubscriptionController from './controllers/emailSubscription.controller.js';

export function createApp() {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(compression());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Better Auth endpoints
  app.all('/api/auth/*', async (req, res) => {
    return auth.handler(req, res);
  });

  // Apply rate limiting to API routes
  app.use('/api', limiter);

  // API Routes
  app.use('/api/properties', propertyController);
  app.use('/api/valuations', valuationController);
  app.use('/api/suburbs', suburbController);
  app.use('/api/leads', leadController);
  app.use('/api/agent', agentSignupController); // Public agent signup (must come before authenticated routes)
  app.use('/api/agent', agentController); // Authenticated agent routes
  app.use('/api/admin', adminController);
  app.use('/api/stripe', stripeController);
  app.use('/api/subscriptions', emailSubscriptionController);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
