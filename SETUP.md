# Zillow NZ - Setup Guide

Complete setup instructions for the NZ Zillow-style property platform.

## Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose
- npm or yarn
- Git

## Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd zillow-agent-lead-gen-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Infrastructure Services

Start PostgreSQL and Redis using Docker Compose:

```bash
# From root directory
docker compose up -d

# Verify services are running
docker compose ps
```

Expected output:
```
NAME                IMAGE                    STATUS
zillow-postgres     postgres:16-alpine       Up (healthy)
zillow-redis        redis:7-alpine           Up (healthy)
```

### 3. Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env

# Edit .env and update any values if needed
# The defaults work for local development
```

**Key environment variables:**
```env
# Database (matches docker-compose.yml)
DATABASE_URL=postgresql://user:password@localhost:5432/zillow_nz

# Redis (matches docker-compose.yml)
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth (generate a secure random string)
AUTH_SECRET=your-super-secret-key-change-in-production

# Email (optional for development)
RESEND_API_KEY=re_xxxxxxxxxxxx  # Get from resend.com

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### 4. Database Setup

Generate and run migrations:

```bash
cd backend

# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

This will create:
-  3 sample agents (Sarah Johnson, Michael Chen, Emma Williams)
-  4 agent subscriptions across different suburbs
-  5 sample properties (Auckland, Wellington, Christchurch)
-  3 sales records
-  5 rental statistics
-  5 property valuations

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3001`

### 6. Verify Setup

Visit these URLs to verify everything works:

- Frontend: http://localhost:3001
- API Health: http://localhost:3000/health
- API Docs: http://localhost:3000/api-docs
- Sample Property: http://localhost:3001/property/<property-id>

## Sample Accounts

After seeding, you can use these test agents:

### Agent 1: Sarah Johnson
- **Email:** sarah.johnson@example.com
- **Suburbs:** Albany, Browns Bay
- **Tier:** Premium (Albany), Basic (Browns Bay)

### Agent 2: Michael Chen
- **Email:** michael.chen@example.com
- **Suburbs:** Lower Hutt
- **Tier:** Seller

### Agent 3: Emma Williams
- **Email:** emma.williams@example.com
- **Suburbs:** Riccarton
- **Tier:** Premium

## Testing Lead Flow

1. Visit a property page: `http://localhost:3001/property/<id>`
2. Fill out the "Contact Agent" form
3. Submit lead
4. Check logs to see:
   - Lead created
   - Agent assigned (based on suburb)
   - Email notification queued
   - Agent metrics updated

5. Login as agent to view leads in dashboard:
   - Visit: `http://localhost:3001/dashboard/agent`
   - (Auth setup required - see BetterAuth docs)

## Development Workflow

### Database Changes

When you modify the schema in `backend/src/models/schema.ts`:

```bash
# Generate new migration
npm run db:generate

# Review the generated SQL in drizzle/ folder

# Apply migration
npm run db:migrate
```

### View Database

Use Drizzle Studio to browse data:

```bash
cd backend
npm run db:studio
```

Opens at: `https://local.drizzle.studio`

### Type Synchronization

Sync Zod schemas between frontend and backend:

```bash
cd backend
npm run type-sync
```

This copies shared types to `frontend/src/lib/types.ts`.

## Background Jobs

Background workers are enabled by default in development.

**What runs automatically:**
- **Nightly (2 AM):** Data ingestion for properties, sales, rentals
- **Weekly (3 AM Sunday):** AVM model retraining

**Monitor jobs:**
```bash
# Check worker logs
cd backend
npm run dev | grep -i "worker"
```

**Manually trigger jobs:**

API endpoints (requires admin auth):
- `POST /api/admin/ingest/properties`
- `POST /api/admin/ingest/sales`
- `POST /api/admin/valuations/recompute/:suburb`

## Email Setup (Optional)

For email notifications to work:

1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Zillow NZ
   ```
4. Restart backend server

Without Resend, emails will be logged but not sent.

## Troubleshooting

### Database Connection Failed

**Error:** `Error: connect ECONNREFUSED ::1:5432`

**Solution:**
```bash
# Check if Postgres is running
docker compose ps

# Restart if needed
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### Redis Connection Failed

**Error:** `Error: connect ECONNREFUSED ::1:6379`

**Solution:**
```bash
# Restart Redis
docker compose restart redis

# Check logs
docker compose logs redis
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env file
```

### Migrations Not Running

**Error:** `Can't find table "properties"`

**Solution:**
```bash
cd backend

# Check if migrations folder exists
ls drizzle/

# If empty or missing, regenerate
npm run db:generate

# Apply migrations
npm run db:migrate

# Verify tables created
npm run db:studio
```

## Production Deployment

### Environment Setup

1. Update `.env` with production values:
   ```env
   NODE_ENV=production
   DATABASE_URL=<production-postgres-url>
   REDIS_HOST=<production-redis-host>
   AUTH_SECRET=<strong-random-secret>
   CORS_ORIGIN=<your-frontend-domain>
   ```

2. Build applications:
   ```bash
   # Backend
   cd backend
   npm run build

   # Frontend
   cd frontend
   npm run build
   ```

3. Run migrations:
   ```bash
   cd backend
   npm run db:migrate
   ```

4. Start servers:
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (using Next.js)
   cd frontend
   npm start
   ```

### Docker Swarm (Recommended)

Deploy using Docker Swarm as per technical plan:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-stack.yml zillow

# Scale services
docker service scale zillow_backend=3
docker service scale zillow_frontend=2
```

## Next Steps

### Implement Data Collection

The infrastructure is ready but data collection needs implementation:

**Location:** `backend/src/jobs/workers.ts`

Implement actual data fetching in:
- `dataIngestionWorker` (line 20)
- LINZ API integration
- Council data scraping
- MBIE rental data ingestion

**See:** `plan/technical-plan.md` for API details

### Build ML Valuation Model

Current valuation is formula-based. To upgrade:

1. Create Python ML service (FastAPI)
2. Train XGBoost/LightGBM model
3. Deploy as microservice
4. Update `backend/src/services/valuation.service.ts` to call ML API

### Implement Authentication

Set up BetterAuth for user/agent login:

**Docs:** https://better-auth.com/docs

## Support

- **Documentation:** See `/plan/technical-plan.md`
- **API Reference:** http://localhost:3000/api-docs
- **Issues:** Create GitHub issue

---

**Built with:** Node.js | TypeScript | PostgreSQL | Redis | Next.js | Drizzle ORM | BullMQ
