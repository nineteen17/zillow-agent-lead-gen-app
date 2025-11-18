import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';
import { env } from './env.js';

// Connection options for BullMQ
const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
};

// Create queues
export const dataIngestionQueue = new Queue('data-ingestion', { connection });
export const valuationQueue = new Queue('valuation', { connection });
export const emailQueue = new Queue('email', { connection });

// Queue events
const dataIngestionEvents = new QueueEvents('data-ingestion', { connection });
const valuationEvents = new QueueEvents('valuation', { connection });
const emailEvents = new QueueEvents('email', { connection });

// Event listeners
dataIngestionEvents.on('completed', ({ jobId }) => {
  logger.info(`Data ingestion job ${jobId} completed`);
});

dataIngestionEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Data ingestion job ${jobId} failed:`, failedReason);
});

valuationEvents.on('completed', ({ jobId }) => {
  logger.info(`Valuation job ${jobId} completed`);
});

valuationEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Valuation job ${jobId} failed:`, failedReason);
});

emailEvents.on('completed', ({ jobId }) => {
  logger.info(`Email job ${jobId} completed`);
});

emailEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Email job ${jobId} failed:`, failedReason);
});

logger.info('BullMQ queues initialized');
