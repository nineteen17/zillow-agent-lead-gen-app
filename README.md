# Zillow NZ - Property Platform with Premier Agent System

A complete New Zealand property platform with Zillow-style Premier Agent lead generation system. **100% revenue-ready** with end-to-end agent acquisition, payment processing, and lead management.

## 🎯 What It Does

This platform enables a **complete property listing and agent lead generation business**:

1. **Public Property Search** - Users browse properties and get instant valuations
2. **Lead Capture** - Users contact agents through property pages
3. **Agent Acquisition** - Agents sign up and pay monthly subscriptions ($199-$599/month)
4. **Automatic Lead Routing** - Leads flow to the best available paid agent
5. **Agent Dashboard** - Agents manage leads, track performance, view metrics
6. **Email Notifications** - Instant alerts when new leads arrive
7. **Revenue Generation** - Recurring monthly revenue from agent subscriptions

## 🏗️ Architecture

### Backend
- **Framework**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Queue**: BullMQ (with Redis)
- **Auth**: BetterAuth (email/password + OAuth)
- **Email**: Resend API
- **Payments**: Stripe (subscriptions + webhooks)
- **Workers**: Background email processing
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **State Management**: React hooks + TanStack Query

## 📁 Project Structure

```
zillow-agent-lead-gen-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (env, database, redis, auth)
│   │   ├── controllers/     # API route controllers
│   │   │   ├── agentSignup.controller.ts  # Public agent signup
│   │   │   ├── agent.controller.ts        # Agent dashboard APIs
│   │   │   ├── lead.controller.ts         # Lead creation
│   │   │   └── stripe.controller.ts       # Payment webhooks
│   │   ├── services/        # Business logic layer
│   │   │   ├── lead-routing.service.ts    # Smart lead assignment
│   │   │   ├── email.service.ts           # Email templates
│   │   │   └── stripe.service.ts          # Payment processing
│   │   ├── repositories/    # Data access layer
│   │   ├── models/          # Database schemas (Drizzle) & Zod types
│   │   ├── middleware/      # Express middleware (auth, validation)
│   │   ├── workers/         # Background workers
│   │   │   └── email.worker.ts            # Email queue processor
│   │   └── index.ts         # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   │   ├── for-agents/          # Agent landing page
│   │   │   ├── agent/
│   │   │   │   ├── signup/          # 3-step signup wizard
│   │   │   │   ├── login/           # Agent login
│   │   │   │   ├── dashboard/       # Lead management
│   │   │   │   └── success/         # Post-payment success
│   │   │   ├── property/[id]/       # Property details + lead form
│   │   │   └── suburb/[name]/       # Suburb pages
│   │   ├── components/      # Reusable UI components
│   │   │   ├── LeadForm.tsx         # Contact agent form
│   │   │   └── SocialShare.tsx      # Social sharing
│   │   ├── lib/             # Utilities & API client
│   │   └── types.ts         # TypeScript interfaces
│   └── next.config.mjs
├── plan/                    # Project planning docs & email templates
├── docker-compose.yml       # Development setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- Stripe account (for payments)
- Resend account (for emails)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zillow-agent-lead-gen-app
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Set up Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   npm install
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```

4. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with API URL
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api-docs

### Using Docker Compose (Full Stack)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 3001 (requires separate npm install/dev)

## 📚 API Documentation

Access the Swagger documentation at: **http://localhost:3000/api-docs**

### Main API Endpoints

#### Public Endpoints
- `GET /api/properties/search` - Search properties
- `GET /api/properties/:id` - Get property details
- `GET /api/valuations/:propertyId` - Get property valuation
- `GET /api/suburbs/:suburb/stats` - Get suburb statistics
- `POST /api/leads` - Create a new lead (public - no auth)
- `POST /api/agent/signup` - Agent signup with Stripe checkout (public)

#### Agent Endpoints (Requires Authentication)
- `GET /api/agent/me` - Get agent profile
- `GET /api/agent/leads` - List agent's leads
- `PATCH /api/agent/leads/:id` - Update lead status
- `GET /api/agent/subscriptions` - Get active subscriptions
- `GET /api/agent/metrics` - Get performance metrics

#### Stripe Endpoints
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/cancel-subscription/:id` - Cancel subscription

#### Admin Endpoints (Requires Admin Role)
- `POST /api/admin/ingest/properties` - Bulk ingest properties
- `POST /api/admin/ingest/sales` - Bulk ingest sales data
- `POST /api/admin/valuations/recompute/:suburb` - Recompute valuations

## 🎯 Key Features

### Complete Agent Acquisition Funnel ✅

**Landing Page → Signup → Payment → Dashboard → Leads**

1. **Agent Landing Page** (`/for-agents`)
   - Pricing comparison ($199/$399/$599)
   - Testimonials and social proof
   - "Get Started" CTAs

2. **3-Step Signup Wizard** (`/agent/signup`)
   - Step 1: Agent details (name, email, password, phone, agency)
   - Step 2: Choose suburbs (autocomplete search)
   - Step 3: Review & proceed to Stripe payment

3. **Stripe Integration**
   - Redirects to Stripe Checkout
   - Creates subscription on payment success
   - Handles webhooks for subscription lifecycle

4. **Post-Payment Flow**
   - Success page with onboarding instructions
   - Welcome email sent automatically
   - Account ready for login

### Intelligent Lead Routing ✅

Automatically assigns leads to the best available agent based on:

- **Subscription Tier**: Seller ($599) > Premium ($399) > Basic ($199)
- **Lead Quota**: Respects monthly lead caps (Basic: 10, Premium: 50, Seller: 999)
- **Performance Metrics**: Response time and conversion rate
- **Geographic Coverage**: Suburb-based subscriptions
- **Availability**: Skips agents who reached their cap

### Agent Dashboard ✅

**Complete lead management interface** (`/agent/dashboard`)

- **Lead Management**:
  - View all assigned leads
  - Filter by status (new, contacted, qualified, won, lost)
  - Update lead status with one-click buttons
  - Direct contact (email/phone links)
  - View associated property details

- **Real-time Metrics**:
  - Total leads assigned
  - Leads contacted (with contact rate %)
  - Leads converted (with conversion rate %)
  - Active suburbs count

- **Subscription Overview**:
  - All active suburbs displayed
  - Tier and monthly price shown
  - Active status indicators

### Email Notifications ✅

**Automated email system** with BullMQ worker

- **Lead Notifications**: Instant email to agent when new lead arrives
- **Welcome Emails**: Sent after agent signs up
- **Beautiful HTML Templates**: Professional design with branding
- **Rate Limited**: 10 emails/second to prevent spam
- **Automatic Retries**: Failed emails retry automatically

### Valuation Engine (Heuristic)

Current implementation uses formula-based approach:
- Base value from Council CV/RV
- Adjustments for property characteristics (bedrooms, bathrooms, land area)
- Suburb median calibration
- ±10% confidence bands

*Future: ML model (XGBoost/LightGBM) for improved accuracy*

### Viral Features ✅

- **Social Sharing**: Share properties on Twitter, Facebook, WhatsApp, LinkedIn
- **OG Images**: Dynamic Open Graph images for social media
- **Email Subscriptions**: Users can subscribe to suburb updates
- **Suburb Comparison**: Compare multiple suburbs side-by-side

## 💳 Subscription Tiers

### Basic - $199/month
- 10 leads per month
- Suburb exclusivity
- Email notifications
- Basic analytics dashboard
- Profile page with photo & bio

### Premium - $399/month ⭐ Most Popular
- 15 leads per month
- Priority lead routing
- SMS + Email notifications
- Advanced analytics & insights
- Featured agent badge
- Priority customer support

### Seller Plus - $599/month
- 25 seller leads per month
- Highest priority routing
- Seller lead specialization
- All Premium features

## 🔐 Authentication

**BetterAuth** with support for:
- Email/password authentication
- OAuth providers (Google, GitHub - configurable)
- Session management with Redis caching
- Role-based access control (user, agent, admin)
- Secure password hashing

**Agent Login**: `/agent/login`

## 🔄 Complete Lead Flow (End-to-End)

1. **User visits property page** → Fills out "Contact an Agent" form
2. **Backend receives lead** → `POST /api/leads`
3. **Lead routing service** → Finds agents subscribed to that suburb
4. **Agent ranking** → Scores by tier, performance, availability
5. **Lead assignment** → Assigns to best agent, updates metrics
6. **Email queued** → BullMQ adds notification job
7. **Email worker** → Processes queue, sends via Resend
8. **Agent receives email** → With lead details and dashboard link
9. **Agent logs in** → `/agent/login` → `/agent/dashboard`
10. **Agent manages lead** → Updates status (new → contacted → qualified → won/lost)
11. **Metrics update** → Conversion rates and performance tracked

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

## 📝 Environment Variables

### Backend (.env)

**Required for Production:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zillow_nz

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
AUTH_SECRET=your-secret-min-32-chars
AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Zillow NZ

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Features
ENABLE_BACKGROUND_JOBS=true
```

**Optional:**

```env
# CORS
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Background Jobs
DATA_INGESTION_CRON=0 2 * * *
AVM_TRAINING_CRON=0 3 * * 0
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

## 🐳 Deployment

### Production with Docker Compose

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Environment Setup

1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure Stripe webhooks: `https://yourdomain.com/api/stripe/webhook`
4. Configure Resend domain and API key
5. Set all environment variables in production

### Stripe Webhook Configuration

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Service Logs
```bash
# View backend logs
docker-compose logs -f backend

# View email worker logs
docker-compose logs -f backend | grep "email.worker"
```

### Redis Queue Monitoring
```bash
# Connect to Redis
redis-cli

# View queue length
LLEN bull:email:wait
LLEN bull:email:active
LLEN bull:email:completed
```

## 🧪 Testing

### Manual Testing Flow

1. **Test Agent Signup**:
   - Go to `/for-agents`
   - Click "Get Started"
   - Fill 3-step form
   - Use Stripe test card: `4242 4242 4242 4242`
   - Check welcome email

2. **Test Lead Creation**:
   - Go to any property page
   - Fill "Contact an Agent" form
   - Check agent receives email
   - Verify lead appears in dashboard

3. **Test Dashboard**:
   - Login at `/agent/login`
   - View leads
   - Update lead status
   - Check metrics update

### Automated Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📈 Business Metrics

### Revenue Calculation

With 20 paying agents:
- 10 Basic ($199) = $1,990/month
- 7 Premium ($399) = $2,793/month
- 3 Seller ($599) = $1,797/month
- **Total MRR: $6,580**

### Lead Volume Capacity

- Basic agents: 10 leads × 10 agents = 100 leads/month
- Premium agents: 50 leads × 7 agents = 350 leads/month
- Seller agents: 999 leads × 3 agents = 2,997 leads/month
- **Total capacity: 3,447 leads/month**

## 🗺️ Roadmap

### ✅ Phase 1: MVP Complete (Revenue Ready)

**Agent Acquisition**
- [x] Agent landing page with pricing
- [x] 3-step signup wizard
- [x] Stripe payment integration
- [x] Welcome email automation
- [x] Success/cancel pages

**Lead Management**
- [x] Lead capture forms on property pages
- [x] Intelligent lead routing (tier-based, performance-based)
- [x] Email notifications to agents
- [x] Agent dashboard (lead management)
- [x] Lead status workflow (new → contacted → qualified → won/lost)
- [x] Performance metrics tracking

**Core Platform**
- [x] Property search and details
- [x] Heuristic valuation engine
- [x] Suburb pages with SEO
- [x] Social sharing (Twitter, Facebook, WhatsApp, LinkedIn)
- [x] Email subscriptions
- [x] Authentication system (BetterAuth)

**Infrastructure**
- [x] PostgreSQL database with Drizzle ORM
- [x] Redis caching
- [x] BullMQ job queue
- [x] Email worker (background processing)
- [x] Swagger API documentation

### 🔄 Phase 2: Growth & Optimization (Optional)

**Agent Features**
- [ ] Agent profile pages (public)
- [ ] SMS notifications (Twilio integration)
- [ ] Subscription management UI (add/remove suburbs, upgrade tier)
- [ ] Password reset flow
- [ ] Agent reviews & ratings

**Platform Enhancements**
- [ ] ML-based valuation model (XGBoost/LightGBM)
- [ ] Advanced search filters
- [ ] Map-based property browser
- [ ] Property alerts & saved searches
- [ ] Mobile app APIs

**Analytics**
- [ ] Advanced agent performance analytics
- [ ] Lead conversion funnel tracking
- [ ] Revenue dashboards
- [ ] A/B testing framework

### 🚀 Phase 3: Scale & Enterprise (Future)

**Advanced Features**
- [ ] Mortgage calculator integration
- [ ] Multi-language support (Maori, Chinese)
- [ ] Agent team management
- [ ] White-label solutions for agencies
- [ ] API marketplace

**Business Tools**
- [ ] Advanced reporting & BI
- [ ] Custom integrations (CRM, PMS)
- [ ] Webhooks system
- [ ] API rate limiting tiers

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linter
4. Commit with clear message
5. Push to your branch
6. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check the [API documentation](http://localhost:3000/api-docs)
2. Review the [agent outreach templates](./plan/agent-outreach-email-templates.md)
3. Open an issue on GitHub

## 🎉 Summary

This platform delivers a **complete, end-to-end revenue-generating system**:

- 💰 **Agents sign up and pay** monthly subscriptions ($199-$599)
- 📧 **Leads flow automatically** from property pages to paid agents
- 📊 **Professional dashboard** for lead management
- 📈 **Performance tracking** for optimization
- ✅ **100% operational** - ready to generate revenue

**The money maker is ready!** 🚀

---

**Built with ❤️ for the NZ property market**
