import { Worker } from 'bullmq';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { ValuationService } from '../services/valuation.service.js';
import { EmailService } from '../services/email.service.js';
import { LINZService } from '../services/data-ingestion/linz.service.js';
import { CouncilService } from '../services/data-ingestion/council.service.js';
import { MBIEService } from '../services/data-ingestion/mbie.service.js';

const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
};

const valuationService = new ValuationService();
const emailService = new EmailService();
const linzService = new LINZService();
const councilService = new CouncilService();
const mbieService = new MBIEService();

/**
 * Data Ingestion Worker
 * Handles background data ingestion tasks
 */
export const dataIngestionWorker = new Worker(
  'data-ingestion',
  async (job) => {
    logger.info(`Processing data ingestion job: ${job.id}`, job.data);

    const { type, data } = job.data;

    switch (type) {
      case 'properties': {
        // Ingest properties data from LINZ
        logger.info('Ingesting properties data from LINZ');
        const { suburb } = data || {};

        if (!suburb) {
          throw new Error('Suburb required for property ingestion');
        }

        const result = await linzService.importAddressesToProperties(suburb);
        return { success: true, ...result };
      }

      case 'sales': {
        // Ingest sales data from Council
        logger.info('Ingesting sales data from Council');
        const { csvData } = data || {};

        if (!csvData || !Array.isArray(csvData)) {
          throw new Error('CSV data required for sales ingestion');
        }

        const result = await councilService.importSalesFromCSV(csvData);
        return { success: true, ...result };
      }

      case 'rentals': {
        // Ingest rental data from MBIE
        logger.info('Ingesting rental data from MBIE');
        const { csvData } = data || {};

        if (!csvData || !Array.isArray(csvData)) {
          throw new Error('CSV data required for rental ingestion');
        }

        const result = await mbieService.importRentalStatsFromCSV(csvData);
        return { success: true, ...result };
      }

      case 'council-properties': {
        // Import council rating data from CSV
        logger.info('Importing council property data from CSV');
        const { csvData } = data || {};

        if (!csvData || !Array.isArray(csvData)) {
          throw new Error('CSV data required for council property ingestion');
        }

        const result = await councilService.importFromCSV(csvData);
        return { success: true, ...result };
      }

      default:
        logger.warn(`Unknown data ingestion type: ${type}`);
        throw new Error(`Unknown ingestion type: ${type}`);
    }

    return { success: true, processed: data?.length || 0 };
  },
  {
    connection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
  }
);

/**
 * Valuation Worker
 * Handles property valuation computations
 */
export const valuationWorker = new Worker(
  'valuation',
  async (job) => {
    logger.info(`Processing valuation job: ${job.id}`, job.data);

    const { propertyId, suburb } = job.data;

    if (propertyId) {
      // Compute valuation for single property
      const valuation = await valuationService.computeValuation(propertyId);
      return { success: true, valuation };
    } else if (suburb) {
      // Recompute valuations for entire suburb
      const results = await valuationService.recomputeValuationsForSuburb(suburb);
      return { success: true, count: results.length };
    }

    throw new Error('Invalid valuation job data');
  },
  {
    connection,
    concurrency: 5,
  }
);

/**
 * Email Worker
 * Handles email sending
 */
export const emailWorker = new Worker(
  'email',
  async (job) => {
    logger.info(`Processing email job: ${job.id}`, job.data);

    const { type, data } = job.data;

    switch (type) {
      case 'lead-notification':
        await emailService.sendLeadNotification(data);
        break;

      case 'agent-welcome':
        await emailService.sendAgentWelcomeEmail(data);
        break;

      default:
        logger.warn(`Unknown email type: ${type}`);
    }

    return { success: true };
  },
  {
    connection,
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 60000, // 100 emails per minute
    },
  }
);

// Error handlers
dataIngestionWorker.on('failed', (job, err) => {
  logger.error(`Data ingestion job ${job?.id} failed:`, err);
});

valuationWorker.on('failed', (job, err) => {
  logger.error(`Valuation job ${job?.id} failed:`, err);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err);
});

logger.info('Background workers initialized');
