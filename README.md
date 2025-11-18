# Zillow NZ - Property Platform with Premier Agent System

A New Zealand property platform with Zillow-style Premier Agent lead generation system. Built with modern web technologies and microservices architecture.

## 🏗️ Architecture

### Backend
- **Framework**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Queue**: RabbitMQ + BullMQ
- **Auth**: BetterAuth
- **Email**: Resend + React Email
- **Payments**: Stripe
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Maps**: Mapbox GL / Google Maps (optional)

## 📁 Project Structure

```
zillow-agent-lead-gen-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API route controllers
│   │   ├── services/        # Business logic layer
│   │   ├── repositories/    # Data access layer
│   │   ├── models/          # Database schemas & Zod types
│   │   ├── middleware/      # Express middleware
│   │   ├── jobs/            # Background workers
│   │   ├── emails/          # Email templates
│   │   └── index.ts         # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript types
│   └── next.config.mjs
├── plan/                    # Project planning docs
├── docker-compose.yml       # Development setup
├── docker-compose.prod.yml  # Production setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zillow-agent-lead-gen-app
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis rabbitmq
   ```

3. **Set up Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```

4. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm install
   npm run dev
   ```

The API will be available at `http://localhost:3000`
The frontend will be available at `http://localhost:3001`

### Using Docker Compose (Full Stack)

```bash
docker-compose up -d
```

This starts all services:
- PostgreSQL on port 5432
- Redis on port 6379
- RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)
- Backend API on port 3000
- Frontend on port 3001 (requires separate npm install/dev)

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api-docs

### Main API Endpoints

#### Public Endpoints
- `GET /api/properties/search` - Search properties
- `GET /api/properties/:id` - Get property details
- `GET /api/valuations/:propertyId` - Get property valuation
- `GET /api/suburbs/:suburb/stats` - Get suburb statistics
- `POST /api/leads` - Create a new lead

#### Agent Endpoints (Requires Authentication)
- `GET /api/agent/me` - Get agent profile
- `GET /api/agent/leads` - List agent's leads
- `PATCH /api/agent/leads/:id` - Update lead status
- `GET /api/agent/subscriptions` - Get subscriptions
- `GET /api/agent/metrics` - Get performance metrics

#### Admin Endpoints (Requires Admin Role)
- `POST /api/admin/ingest/properties` - Bulk ingest properties
- `POST /api/admin/ingest/sales` - Bulk ingest sales data
- `POST /api/admin/retrain-avm` - Trigger AVM retraining
- `POST /api/admin/valuations/recompute/:suburb` - Recompute suburb valuations

## 🔧 Development

### Database Commands

```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (DB GUI)
npm run db:studio

# Seed database (when implemented)
npm run db:seed
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Build TypeScript
npm run build

# Run tests
npm test
```

## 🐳 Deployment

### Production with Docker Swarm

1. **Initialize Swarm** (if not already done)
   ```bash
   docker swarm init
   ```

2. **Create production environment file**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Deploy stack**
   ```bash
   ./docker-swarm-deploy.sh
   ```

4. **Monitor services**
   ```bash
   docker stack services zillow-nz
   docker service logs -f zillow-nz_backend
   ```

### CI/CD with GitHub Actions

The project includes a GitHub Actions workflow that:
1. Runs linter and tests on every PR
2. Builds and pushes Docker images on main branch
3. Deploys to production (configure deployment step)

Required GitHub Secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password

## 🎯 Key Features

### Lead Routing System

The platform automatically routes leads to agents based on:
- **Subscription Tier**: Seller > Premium > Basic
- **Lead Quota**: Respects monthly lead caps
- **Performance Metrics**: Response time and conversion rate
- **Geographic Coverage**: Suburb-based subscriptions

### Valuation Engine (MVP)

Current implementation uses a formula-based approach:
- Base value from Council CV/RV
- Adjustments for property characteristics
- Suburb median calculations
- ±10% confidence bands

Future: Replace with ML model (XGBoost/LightGBM)

### Caching Strategy

- Property details: 1 hour
- Valuations: 6 hours
- Suburb stats: 24 hours
- Cache invalidation on updates

### Background Jobs

- **Nightly Data Ingestion** (2 AM): Properties, sales, rentals
- **Weekly AVM Training** (3 AM Sunday): Recompute valuations
- **Email Queue**: Async email sending
- **Valuation Queue**: Batch valuation computations

## 🔐 Authentication

Uses BetterAuth with support for:
- Email/password authentication
- OAuth providers (Google, GitHub - configurable)
- Session management with Redis caching
- Role-based access control (user, agent, admin)

## 💳 Subscription Tiers

### Basic - $99/month
- 10 leads per month
- Basic suburb coverage

### Premium - $249/month
- 50 leads per month
- Priority lead routing
- Enhanced analytics

### Seller - $499/month
- 999 leads per month
- Highest priority
- Seller lead specialization

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Service Logs
```bash
# Docker Compose
docker-compose logs -f backend

# Docker Swarm
docker service logs -f zillow-nz_backend
```

### RabbitMQ Management UI
Access at http://localhost:15672 (guest/guest in dev)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Environment Variables

See `backend/.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` / `REDIS_PORT` - Redis connection
- `RABBITMQ_URL` - RabbitMQ connection
- `AUTH_SECRET` - BetterAuth secret (min 32 chars)
- `RESEND_API_KEY` - Email service API key
- `STRIPE_SECRET_KEY` - Stripe API key

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linter
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check the [API documentation](http://localhost:3000/api-docs)
2. Review the [technical plan](./plan/technical-plan.md)
3. Open an issue on GitHub

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- [x] Database schema and migrations
- [x] Authentication system
- [x] Property and valuation APIs
- [x] Lead capture and routing
- [x] Agent dashboard APIs
- [x] Email notifications
- [x] Stripe subscriptions

### Phase 2 (Next)
- [ ] ML-based AVM model
- [ ] Advanced search filters
- [ ] Map-based property browser
- [ ] Agent performance analytics
- [ ] Mobile app APIs
- [ ] Webhooks system

### Phase 3 (Future)
- [ ] Mortgage calculator integration
- [ ] Property alerts & saved searches
- [ ] Agent reviews & ratings
- [ ] Advanced reporting & BI
- [ ] Multi-language support
- [ ] API rate limiting tiers

---

**Built with ❤️ for the NZ property market**
