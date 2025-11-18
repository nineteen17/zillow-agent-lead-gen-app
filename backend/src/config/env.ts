import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.string().default('2'),
  DB_POOL_MAX: z.string().default('10'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0'),

  // RabbitMQ
  RABBITMQ_URL: z.string().url().default('amqp://localhost:5672'),
  RABBITMQ_EXCHANGE: z.string().default('zillow_exchange'),
  RABBITMQ_QUEUE_PREFIX: z.string().default('zillow'),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  BETTER_AUTH_SESSION_EXPIRES_IN: z.string().default('7d'),

  // Resend Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Logging
  LOG_LEVEL: z.string().default('info'),

  // Background Jobs
  ENABLE_BACKGROUND_JOBS: z.string().default('true'),
  DATA_INGESTION_CRON: z.string().default('0 2 * * *'),
  AVM_TRAINING_CRON: z.string().default('0 3 * * 0'),

  // External APIs
  LINZ_API_KEY: z.string().optional(),
  COUNCIL_API_KEYS: z.string().optional(),

  // S3
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
