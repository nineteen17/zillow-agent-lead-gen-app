import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database.js';
import { redis } from './config/redis.js';
import { emailWorker } from './workers/email.worker.js';

const port = parseInt(env.PORT);

async function start() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connection successful');

    // Start workers (if enabled)
    if (env.ENABLE_BACKGROUND_JOBS === 'true') {
      logger.info('Background workers started (email notifications, etc.)');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API URL: ${env.API_URL}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await closeDatabaseConnection();

        // Close workers
        if (env.ENABLE_BACKGROUND_JOBS === 'true') {
          await emailWorker.close();
          logger.info('Workers closed');
        }

        // Close Redis connection
        await redis.quit();
        logger.info('Redis connection closed');

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
