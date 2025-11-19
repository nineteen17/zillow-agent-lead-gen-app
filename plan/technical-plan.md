NZ Zillow-Style Platform — Technical Architecture (MVP)

Technical plan for a NZ property data & lead-gen platform using a modern web stack. Business model: Zillow-style Premier Agent.

⸻

1. High-Level Architecture

Core idea:
	•	Ingest and normalise NZ property & rental data
	•	Expose it via an internal API
	•	Build a fast, SEO-friendly web frontend
	•	Layer on a basic AVM (valuation model)
	•	Capture and route buyer/seller leads to paying agents

Main components:
	1.	Frontend — Next.js app (csr using tanstack query) typescript
	2.	Backend API — Node/Express (or Nest-like structure) with typed routes, controller and serivce pattern no route. typescript
	3.	Database — Postgres (e.g. Supabase)
	4.	Object Storage — S3-compatible (AWS / Cloudflare R2)
	5.	Background Workers — for data ingestion + model training
	6.	Valuation Service — Node-based
	7.	Auth + Sessions — BetterAuth
	8.	Queues — Rabbitmq
    9.  email - resend sdk wioth react email
    10. stripe payments
    11. docker compose for dev, swarm for production
    12 cicd using gh actions
    13 redis caching
    14 bullmq if neeeded for things like scheduling
    15 zod schemas with custom script forautomation to sync type in both the frontend and backend
    16 swagger docs

⸻

2. Data Sources (MVP)

2.1 Property & Geospatial Data
	•	LINZ Address Dataset
	•	National list of addresses
	•	Use to create a core properties table keyed by address ID
	•	LINZ Parcels / Titles (paid per lookup)
	•	Use selectively for additional metadata or verification
	•	Council Rating Data
	•	CV/RV (capital/rateable value)
	•	Land area, floor area, year built etc.
	•	Ingestion via:
	•	Public CSV/Excel downloads where available
	•	Scraping of property info pages otherwise (with rate limiting)

2.2 Sales Data
	•	Council “recent sales” sections
	•	Public sales in local newspapers / portals
	•	Scraped listing archives (OneRoof / Realestate / others)
	•	Normalise into sales table:
	•	property_id
	•	sale_date
	•	sale_price
	•	source
	•	confidence_score

2.3 Rental Data
	•	MBIE / Tenancy Services rental bond data
	•	Median rents by suburb, bedrooms, property type
	•	Ingest into rental_stats table

2.4 Agent & Office Data
	•	Manual onboarding for MVP:
	•	Agent name, agency, license number
	•	Suburbs served
	•	Contact details, headshot, branding
	•	Later: scraping agency websites for public agent rosters

2.5 User-Contributed Data
	•	Homeowner “claim your property” flow:
	•	Correct beds/baths, renos, photos
	•	Store overrides in property_overrides
	•	This improves AVM and engagement.

⸻

3. Data Model (Core Tables)

Core entities:
	•	properties
	•	id
	•	linz_address_id
	•	address_line1, suburb, city, postcode
	•	lat, lng
	•	cv_value
	•	land_area_sqm, floor_area_sqm
	•	year_built
	•	property_type
	•	source_flags
	•	sales
	•	id
	•	property_id
	•	sale_date
	•	sale_price
	•	source
	•	is_inferred
	•	rental_stats
	•	id
	•	suburb
	•	bedrooms
	•	weekly_rent_median
	•	sample_size
	•	period_start, period_end
	•	agents
	•	id
	•	name
	•	email
	•	phone
	•	agency_name
	•	license_number
	•	regions
	•	profile_bio
	•	photo_url
	•	agent_subscriptions
	•	id
	•	agent_id
	•	suburb
	•	tier (basic/premium/seller)
	•	monthly_price
	•	lead_cap_per_month
	•	active_from, active_to
	•	leads
	•	id
	•	lead_type (buyer/seller/mortgage/rental)
	•	property_id (nullable)
	•	suburb
	•	name, email, phone
	•	message
	•	source (web, valuation_page, suburb_page)
	•	assigned_agent_id
	•	status (new, contacted, qualified, closed_won, closed_lost)
	•	agent_metrics
	•	agent_id
	•	period
	•	avg_response_time_seconds
	•	leads_assigned
	•	leads_contacted
	•	leads_converted
	•	property_overrides
	•	id
	•	property_id
	•	user_id
	•	beds, baths, floor_area_sqm, notes
	•	verified (bool)
	•	valuations
	•	id
	•	property_id
	•	estimate_value
	•	estimate_date
	•	model_version
	•	confidence_band_low
	•	confidence_band_high

⸻

4. Backend Stack & API Design

4.1 Tech Choices
	•	Language: TypeScript (Node.js)
	•	Framework: Express (with clear layering)
	•	ORM: Drizzle
	•	Database: Postgres (Supabase)
	•	Auth: BetterAuth
	•	Caching: Redis (optional, for hot suburbs & valuations)

4.2 API Layers
	1.	Public API (used by frontend)
	•	/api/properties/:id
	•	/api/valuations/:propertyId
	•	/api/suburbs/:suburb/stats
	•	/api/properties/search (address, suburb, filters)
	•	/api/leads (POST) — create buyer/seller lead
	2.	Agent API (authenticated)
	•	/api/agent/me
	•	/api/agent/leads
	•	/api/agent/subscriptions
	•	/api/agent/metrics
	3.	Admin / Internal API
	•	/api/admin/ingest/*
	•	/api/admin/retrain-avm
	•	/api/admin/override-property

Use a clean, layered structure:
	•	
	•	controllers/ (routes built into controller)
	•	services/
	•	repositories/
	•	models/

⸻

5. Frontend Stack & UX Considerations

5.1 Tech
	•	Framework: Next.js 16 (App Router)
	•	Styling: Tailwind CSS (latest)
	•	Data Fetching: React Query for client state. server side not needed
	•	Maps: Mapbox GL or Google Maps JS SDK

5.2 Key Pages
	•	/ — Landing + search
	•	/property/[id] — Property profile + valuation + agent box
	•	/suburb/[slug] — Suburb stats, sales, rentals
	•	/estimate — Enter address → show valuation + agent CTA
	•	/agents / /for-agents — Sales page for Premier Agent
	•	/dashboard/agent — Lead inbox & metrics (protected)

5.3 Lead Capture UX

On property & valuation pages:
	•	Prominent “Talk to an agent” / “Request a tour” panel
	•	Clear form fields: name, email, phone, time-frame
	•	Optional toggle: “I also want a free appraisal” (seller lead)

⸻

6. Valuation Model (AVM) — MVP

6.1 Approach

Start with a simple, explainable regression/GBM model and grow into more complex ML once data volume increases.

Inputs (features):
	•	Property-level:
	•	CV/RV
	•	Land area, floor area
	•	Year built
	•	Property type
	•	Beds, baths
	•	Location-level:
	•	Suburb median sale price
	•	Suburb price per sqm
	•	Distance to CBD
	•	Market-level:
	•	Region-level price trend index
	•	Interest rate environment (basic index)

Target:
	•	Normalised sale price (e.g. log(price))

6.2 Pipeline
	1.	Ingest and clean sales + properties
	2.	Filter outliers (very low/high prices)
	3.	Engineer basic features (price per sqm, age, etc.)
	4.	Train model (e.g. LightGBM/XGBoost or even linear regression for v1)
	5.	Store predicted value + confidence bands in valuations
	6.	Re-train model weekly or monthly as new sales data arrive

6.3 Service Design
	•	Separate Valuation Service (Python FastAPI or Node microservice)
	•	Internal endpoint: /internal/valuation/:propertyId
	•	Batch job to precompute for all properties in active suburbs
	•	On-demand valuation if not present in cache/DB

⸻

7. Lead Routing Logic

7.1 Assignment Rules (Premier Agent Style)

For each lead:
	1.	Determine suburb (from property or user input)
	2.	Fetch active agent_subscriptions for that suburb
	3.	Rank agents by:
	•	Tier (seller > premium > basic)
	•	Lead quota remaining
	•	Historical response time (faster first)
	•	Conversion rate
	4.	Assign lead to top-ranked agent and set assigned_agent_id
	5.	Send notifications:
	•	Email
	•	Optional SMS
	•	Push in agent dashboard

7.2 Fallback Rules

If no paying agent in suburb:
	•	Route to a catch-all pool (free beta agents or internal backlog)
	•	Or store as unmonetised and later use as proof-of-value to sell that suburb.

7.3 Lead Lifecycle

States in leads.status:
	•	new
	•	delivered
	•	contacted
	•	qualified
	•	closed_won
	•	closed_lost

Agents update status via dashboard; system tracks conversion for pricing & ranking.

⸻

8. Background Jobs & Ingestion

8.1 Scheduled Jobs
	•	Nightly:
	•	Pull/parse latest council / rental datasets
	•	Update properties, sales, rental_stats
	•	Mark stale records
	•	Weekly:
	•	Retrain AVM model (if enough new data)
	•	Recompute valuations for changed areas

8.2 Tools
	•	Use a worker process (BullMQ on Redis, or simple cron + queue)
	•	Containerised with separate scaling from the main API

⸻

9. Security & Compliance (High-Level)
	•	Protect PII in leads and users tables
	•	Restrict access using row-level security (if using Supabase)
	•	Clearly mark valuations as estimates, not appraisals
	•	Rate limit public endpoints (property search, valuation lookups)
	•	Respect robots.txt and T&Cs of any scraped sources
	•	Use HTTPS everywhere, HSTS enabled

⸻

10. Phase-Based Technical Roadmap (MVP First)

Phase 1 — Foundation 
	•	Set up Postgres + basic schema (properties, sales, valuations)
	•	Implement property search + profile pages
	•	Ingest initial council + rental + basic sales data for 1–2 regions
	•	Hard-coded baseline valuation formula (e.g. CV + suburb adjustment)

Phase 2 — AVM & Leads
	•	Build first ML model (regression/GBM) and valuation service
	•	Integrate valuations into property pages & /estimate flow
	•	Implement lead capture + leads table + simple assignment rules
	•	Build basic agent dashboard (view leads, update status)

Phase 3 — Premier Agent System
	•	Implement agent_subscriptions and suburb-based slots
	•	Build agent onboarding & billing integrations (Stripe)
	•	Add performance scoring + ranking
	•	Improve data coverage to most major NZ centres

Phase 4 — 
	•	Caching, performance tuning, map UX
	•	More advanced AVM features
	•	Extra lead types (mortgage, rental)
	•	Reporting & analytics for agents

⸻

This technical plan intentionally avoids business details and focuses on stack, data, APIs, valuation architecture, and lead routing, so you can build a separate, deeper system design or sequence diagrams later as needed.

⸻

## Implementation Checklist

### Backend Infrastructure
- [x] Initialize backend project structure and package.json
- [x] Set up Docker Compose for development (Postgres, Redis) - RabbitMQ not needed (using BullMQ)
- [x] Configure TypeScript and ESLint
- [x] Create environment configuration and .env.example

### Database & ORM
- [x] Create database schema with Drizzle ORM
- [x] Implement database migrations
- [x] Set up database seeding for development

### Authentication & Authorization
- [x] Set up BetterAuth configuration
- [x] Implement user roles (user, agent, admin)
- [x] Create auth middleware for protected routes

### Type Safety & Validation
- [x] Create shared Zod schemas for all entities
- [x] Implement type sync utilities between frontend/backend
- [x] Set up validation middleware

### Core Application
- [x] Implement Express app setup with middleware
- [x] Create repository layer for database operations
- [x] Implement service layer with business logic
- [x] Set up error handling middleware
- [x] Implement request logging

### Public API Endpoints
- [x] GET /api/properties/:id - Get property details
- [x] GET /api/valuations/:propertyId - Get property valuation
- [x] GET /api/suburbs/:suburb/stats - Get suburb statistics
- [x] GET /api/properties/search - Search properties (enhanced with text search)
- [x] POST /api/leads - Create buyer/seller lead

### Agent API Endpoints
- [x] GET /api/agent/me - Get agent profile
- [x] GET /api/agent/leads - List agent's leads
- [x] PATCH /api/agent/leads/:id - Update lead status
- [x] GET /api/agent/subscriptions - Get agent subscriptions
- [x] GET /api/agent/metrics - Get agent performance metrics

### Admin API Endpoints
- [x] POST /api/admin/ingest/properties - Ingest property data (endpoint ready, needs API integration)
- [x] POST /api/admin/ingest/sales - Ingest sales data (endpoint ready, needs API integration)
- [x] POST /api/admin/ingest/rentals - Ingest rental data (endpoint ready, needs API integration)
- [x] POST /api/admin/retrain-avm - Trigger AVM retraining (placeholder for ML model)
- [ ] POST /api/admin/override-property - Override property data

### Lead Routing System
- [x] Implement lead routing logic service
- [x] Create agent ranking algorithm
- [x] Implement lead assignment rules
- [x] Set up lead notification system (email notifications connected)

### Caching & Queues
- [x] Set up Redis caching layer
- [x] Implement cache invalidation strategies
- [x] ~~Set up RabbitMQ queue system~~ Using BullMQ instead
- [x] Implement BullMQ background jobs
- [x] Create scheduled jobs (nightly data ingestion, weekly AVM training)

### Email System
- [x] Set up Resend email integration
- [x] Create React Email templates (lead notifications, agent onboarding)
- [x] Implement email queue and retry logic

### Payment Integration
- [ ] Implement Stripe payment integration
- [ ] Create subscription management endpoints
- [ ] Set up webhook handlers for payment events
- [ ] Implement billing logic

### API Documentation
- [x] Set up Swagger API documentation
- [x] Document all endpoints with examples
- [~] Add authentication documentation (partial)

### DevOps & Deployment
- [ ] Create GitHub Actions CI/CD workflow
- [ ] Set up Docker build for production
- [ ] Create Docker Swarm production configuration
- [x] Set up health check endpoints

### Documentation
- [x] Write comprehensive README with setup instructions (SETUP.md)
- [x] Document environment variables
- [x] Create API usage examples
- [x] Document development workflow

### Frontend (Phase 2 Additions)
- [x] Property search page with filters
- [x] Property detail pages
- [x] /estimate page with address search and autocomplete
- [x] Agent dashboard with leads management
- [x] Lead capture forms integrated throughout
- [x] Property valuation display with confidence bands

### Next Phase TODO
- [ ] External API integrations (LINZ, Council, MBIE) - See backend/src/jobs/workers.ts
- [ ] ML-based valuation model (Python/FastAPI + XGBoost/LightGBM)
- [ ] Stripe payment integration for agent subscriptions
- [ ] CI/CD pipeline setup
- [ ] Production deployment configuration