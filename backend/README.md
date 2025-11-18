# Backend API

Express.js backend API for Zillow NZ platform.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Drizzle
- **Database**: PostgreSQL 16+
- **Cache**: Redis 7+
- **Queue**: BullMQ + RabbitMQ
- **Auth**: BetterAuth
- **Validation**: Zod
- **Email**: Resend
- **Payments**: Stripe

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database

```bash
# Generate migrations from schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema to database (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run build
```

## Project Structure

```
src/
├── config/          # App configuration
├── controllers/     # Route controllers (routes built-in)
├── services/        # Business logic
├── repositories/    # Data access layer
├── models/          # DB schemas & Zod types
├── middleware/      # Express middleware
├── jobs/            # Background workers
├── emails/          # Email templates
├── utils/           # Utilities
├── app.ts           # Express app
└── index.ts         # Entry point
```

## API Architecture

### Layered Design

1. **Controllers**: Handle HTTP requests/responses, validation
2. **Services**: Business logic, orchestration
3. **Repositories**: Database operations
4. **Models**: Data schemas and types

### Example Flow

```
Request → Controller → Service → Repository → Database
                ↓
             Response
```

## Configuration

Environment variables are validated using Zod in `config/env.ts`.

Required variables:
- `DATABASE_URL`
- `AUTH_SECRET`
- `REDIS_HOST`
- `RABBITMQ_URL`

See `.env.example` for full list.

## Background Jobs

Three worker queues:
1. **Data Ingestion**: Property, sales, rental data
2. **Valuations**: Property valuation computations
3. **Email**: Async email sending

Workers auto-start in production. Configure via:
- `ENABLE_BACKGROUND_JOBS`
- `DATA_INGESTION_CRON`
- `AVM_TRAINING_CRON`
