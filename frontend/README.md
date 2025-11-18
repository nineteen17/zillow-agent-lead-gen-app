# Zillow NZ Frontend

Modern Next.js frontend for the Zillow NZ property platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **UI Icons**: Lucide React
- **Maps**: Mapbox GL / Google Maps (configurable)

## Features

- **Property Search**: Advanced search with filters
- **Property Details**: Detailed property pages with valuations
- **Instant Valuations**: Get property estimates instantly
- **Lead Capture**: Forms for connecting buyers/sellers with agents
- **Agent Dashboard**: Lead management and performance metrics
- **Suburb Statistics**: Market insights by suburb
- **Responsive Design**: Mobile-first responsive layout

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (see ../backend/README.md)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:3000/api

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3001
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with search
│   ├── property/[id]/page.tsx      # Property detail page
│   ├── suburb/[slug]/page.tsx      # Suburb statistics
│   ├── estimate/page.tsx           # Valuation estimate page
│   ├── agents/page.tsx             # Agent marketing page
│   ├── dashboard/agent/page.tsx    # Agent dashboard
│   ├── layout.tsx                  # Root layout
│   ├── providers.tsx               # React Query provider
│   └── globals.css                 # Global styles
├── components/
│   ├── Navigation.tsx              # Main navigation
│   ├── PropertyCard.tsx            # Property card component
│   ├── SearchFilters.tsx           # Search filter form
│   └── LeadForm.tsx                # Lead capture form
├── lib/
│   ├── api-client.ts               # API client wrapper
│   └── query-client.ts             # React Query configuration
└── types/
    └── index.ts                    # TypeScript types
```

## Key Pages

### Landing Page (/)
- Hero section with call-to-action
- Property search with filters
- Featured properties grid
- Benefits showcase

### Property Detail (/property/[id])
- Property information and photos
- Valuation estimate display
- Neighborhood insights
- Lead capture form

### Valuation Estimate (/estimate)
- Address input form
- Instant valuation display
- Agent connection CTA
- Market insights

### Agent Dashboard (/dashboard/agent)
- Lead management table
- Performance metrics
- Status updates
- Contact information

### Suburb Page (/suburb/[slug])
- Market statistics
- Property overview
- Sales history
- Rental market data

## API Integration

The frontend communicates with the backend API using TanStack Query:

```typescript
// Example: Fetching property details
const { data, isLoading } = useQuery({
  queryKey: ['property', id],
  queryFn: () => apiClient.getProperty(id),
});
```

All API methods are in `lib/api-client.ts`.

## Styling

Uses Tailwind CSS with custom utilities:

```css
/* Button styles */
.btn - Base button
.btn-primary - Primary button
.btn-secondary - Secondary button
.btn-outline - Outline button

/* Form inputs */
.input - Styled input field

/* Layout */
.card - Card container
```

## State Management

- **Server State**: TanStack Query for API data
- **UI State**: React useState for local component state
- **Authentication**: BetterAuth (integrated with backend)

## Performance

- Server-side rendering disabled (CSR only as per spec)
- React Query caching (1 minute stale time)
- Image optimization with Next.js Image
- Code splitting by route

## Development Tips

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build and test locally
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t zillow-nz-frontend .

# Run container
docker run -p 3001:3001 zillow-nz-frontend
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Roadmap

- [ ] Add map view for properties
- [ ] Implement saved searches
- [ ] Add property comparison tool
- [ ] Email/SMS notifications
- [ ] Advanced filters (school zones, amenities)
- [ ] Virtual tours integration
- [ ] Mortgage calculator

## License

ISC
