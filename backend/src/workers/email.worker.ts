import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { EmailService } from '../services/email.service.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

const emailService = new EmailService();

// Connection options
const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
};

/**
 * Email Worker - Processes email notifications
 */
export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { type, data } = job.data;

    logger.info(`Processing email job: ${type}`, { jobId: job.id });

    try {
      switch (type) {
        case 'lead-notification':
          await emailService.sendLeadNotification(data);
          break;

        case 'agent-welcome':
          await emailService.sendAgentWelcomeEmail(data);
          break;

        case 'subscription-alert':
          // TODO: Implement subscription alert (approaching lead cap, payment failed, etc.)
          logger.info('Subscription alert email not yet implemented');
          break;

        default:
          logger.warn(`Unknown email type: ${type}`);
      }

      logger.info(`Email job completed: ${type}`, { jobId: job.id });
    } catch (error) {
      logger.error(`Email job failed: ${type}`, { jobId: job.id, error });
      throw error; // This will mark the job as failed and trigger retry
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 emails concurrently
    limiter: {
      max: 10, // Max 10 emails
      duration: 1000, // per second (rate limiting)
    },
  }
);

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Email job ${job.id} failed after ${job.attemptsMade} attempts:`, err);
  }
});

emailWorker.on('error', (err) => {
  logger.error('Email worker error:', err);
});

logger.info('Email worker initialized');
