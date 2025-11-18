import cron from 'node-cron';
import { dataIngestionQueue, valuationQueue } from '../config/bullmq.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Schedule nightly data ingestion
 * Runs at 2 AM daily
 */
export function scheduleDataIngestion() {
  if (!env.ENABLE_BACKGROUND_JOBS || env.ENABLE_BACKGROUND_JOBS === 'false') {
    logger.info('Background jobs disabled, skipping scheduler setup');
    return;
  }

  cron.schedule(env.DATA_INGESTION_CRON, async () => {
    logger.info('Running scheduled data ingestion');

    try {
      // Schedule property data ingestion
      await dataIngestionQueue.add(
        'ingest-properties',
        { type: 'properties', source: 'linz' },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      // Schedule sales data ingestion
      await dataIngestionQueue.add(
        'ingest-sales',
        { type: 'sales', source: 'councils' },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      // Schedule rental data ingestion
      await dataIngestionQueue.add(
        'ingest-rentals',
        { type: 'rentals', source: 'mbie' },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      logger.info('Data ingestion jobs scheduled successfully');
    } catch (error) {
      logger.error('Failed to schedule data ingestion jobs:', error);
    }
  });

  logger.info(`Data ingestion scheduled: ${env.DATA_INGESTION_CRON}`);
}

/**
 * Schedule weekly AVM model retraining
 * Runs at 3 AM every Sunday
 */
export function scheduleAVMTraining() {
  if (!env.ENABLE_BACKGROUND_JOBS || env.ENABLE_BACKGROUND_JOBS === 'false') {
    return;
  }

  cron.schedule(env.AVM_TRAINING_CRON, async () => {
    logger.info('Running scheduled AVM training');

    try {
      // In production, this would trigger ML model retraining
      // For MVP, we just recompute valuations for active suburbs
      const activeSuburbs = ['Auckland Central', 'Wellington Central', 'Christchurch Central']; // Example

      for (const suburb of activeSuburbs) {
        await valuationQueue.add(
          'recompute-suburb',
          { suburb },
          { attempts: 2, backoff: { type: 'exponential', delay: 5000 } }
        );
      }

      logger.info('AVM training jobs scheduled successfully');
    } catch (error) {
      logger.error('Failed to schedule AVM training jobs:', error);
    }
  });

  logger.info(`AVM training scheduled: ${env.AVM_TRAINING_CRON}`);
}

/**
 * Initialize all schedulers
 */
export function initializeSchedulers() {
  scheduleDataIngestion();
  scheduleAVMTraining();
  logger.info('All schedulers initialized');
}
