import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/schema.js';
import { logger } from './logger.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/zillow_nz';

// Create postgres client
const client = postgres(connectionString, {
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema, logger: false });

// Test database connection
export async function testDatabaseConnection() {
  try {
    await client`SELECT 1`;
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
}

// Close database connection
export async function closeDatabaseConnection() {
  try {
    await client.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}
