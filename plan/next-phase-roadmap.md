# Next Phase Roadmap — Growth & Scale

**Status:** MVP Complete (100%) ✅
**Next Phase:** SEO, User Acquisition, Agent Sales

---

## 🎯 Strategic Priority: Own the Top-of-Funnel

Based on Zillow's playbook (see `growth-strategy.md`), our next phase focuses on:

1. **SEO domination** — Programmatic pages for every suburb, street, region
2. **Viral hook** — Make valuations shareable and addictive
3. **Data enrichment** — Add schools, crime, amenities
4. **Agent acquisition** — Convert traffic to paying subscriptions

---

## 📋 Phase 3: SEO Foundation (Weeks 1-4)

### Priority 1: Programmatic SEO Pages

**Goal:** Index 100,000+ pages in Google for long-tail property searches

#### 1.1 Suburb Pages (2,000+ pages)
**Route:** `/suburb/[slug]`

**Content:**
- Median house prices (last 3/6/12 months)
- Recent sales (last 10-20)
- Rental yields
- Market trends chart
- Demographics snapshot
- School zones
- Top local agents
- Property listings in suburb

**SEO Benefits:**
- Rank for "[suburb] house prices"
- Rank for "[suburb] real estate market"
- Rank for "[suburb] property values"

**Implementation:**
```typescript
// frontend/src/app/suburb/[slug]/page.tsx
export async function generateStaticParams() {
  const suburbs = await db.query.properties.findMany({
    columns: { suburb: true },
    groupBy: ['suburb']
  });
  return suburbs.map(s => ({ slug: slugify(s.suburb) }));
}
```

**Tasks:**
- [ ] Create suburb page component
- [ ] Implement suburb stats API endpoint
- [ ] Add suburb trends chart (line graph)
- [ ] Add recent sales table
- [ ] Add agent rankings for suburb
- [ ] Add Schema.org LocalBusiness markup
- [ ] Generate slugs for all 2,000+ suburbs
- [ ] Submit sitemap

#### 1.2 Street Pages (50,000+ pages)
**Route:** `/street/[suburb]/[street-name]`

**Content:**
- All properties on street
- Street median value
- Recent sales on street
- Street-level trends
- Nearby amenities

**Tasks:**
- [ ] Create street page component
- [ ] Implement street stats API endpoint
- [ ] Add street-level map view
- [ ] Generate street slugs
- [ ] Add to sitemap

#### 1.3 Region Pages (16 pages)
**Route:** `/region/[region-name]`

**Content:**
- Regional market overview
- Top suburbs in region
- Investment hotspots
- Historical trends
- Regional agents

**Tasks:**
- [ ] Create region page component
- [ ] Implement region stats API
- [ ] Add regional trends chart
- [ ] List all regions (Auckland, Wellington, etc.)

---

### Priority 2: Schema.org Structured Data

**Goal:** Get rich snippets in Google search results

**Markup Types:**
- `RealEstateListing` for property pages
- `Offer` for valuations
- `Place` for suburbs
- `LocalBusiness` for agents

**Tasks:**
- [ ] Add JSON-LD to property pages
- [ ] Add JSON-LD to suburb pages
- [ ] Add JSON-LD to agent pages
- [ ] Test with Google Rich Results Test
- [ ] Monitor Search Console for rich result impressions

---

### Priority 3: Sitemap & Indexing

**Tasks:**
- [ ] Generate XML sitemap for all pages
- [ ] Split into multiple sitemaps (properties, suburbs, streets)
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor indexing status
- [ ] Fix any crawl errors

---

## 🔥 Phase 4: Viral Hook Features (Weeks 5-8)

### Priority 1: Social Sharing

**Goal:** Make valuations shareable and viral

**Features:**
- Social share buttons (Facebook, Twitter, WhatsApp)
- Custom share text: "My home is worth $X — check yours"
- Open Graph images (auto-generated with property photo + valuation)
- Embeddable widgets for forums

**Tasks:**
- [ ] Add share buttons to /estimate page
- [ ] Add share buttons to property pages
- [ ] Generate OG images dynamically
- [ ] Create embeddable widget (iframe)
- [ ] Track share events in analytics

---

### Priority 2: Email Alerts

**Goal:** Drive repeat visits and habit formation

**Alert Types:**
- "Your property value changed by $X"
- "New sales in your suburb"
- "Your suburb is trending up/down"
- Weekly market digest

**Tasks:**
- [ ] Build email subscription flow
- [ ] Create email templates (React Email)
- [ ] Implement background job for value change detection
- [ ] Send weekly digests
- [ ] Add unsubscribe flow

---

### Priority 3: Suburb Trends & Charts

**Goal:** Make data exploration addictive

**Features:**
- Historical price charts (1/3/5/10 years)
- Suburb comparison tool
- "Fastest growing suburbs"
- "Most searched suburbs"
- Suburb leaderboards

**Tasks:**
- [ ] Build historical price charts (Chart.js / Recharts)
- [ ] Add suburb comparison page
- [ ] Create leaderboard pages
- [ ] Add trend indicators (🔥 hot, 📈 rising, 📉 falling)

---

## 📊 Phase 5: Data Enrichment (Weeks 9-12)

### Priority 1: School Zones

**Data Source:** Ministry of Education

**Features:**
- School zone overlays on map
- School decile ratings
- NCEA pass rates
- Distance to schools

**Tasks:**
- [ ] Import school zone data
- [ ] Add school_zones table
- [ ] Display schools on property pages
- [ ] Add school filter to search
- [ ] Add "properties in [school] zone" pages

---

### Priority 2: Amenities

**Data Source:** Google Places API / OpenStreetMap

**Features:**
- Nearby parks, shops, transport
- Walk score / transit score
- Distance to CBD
- Commute time calculator

**Tasks:**
- [ ] Import amenity data
- [ ] Add amenities to property pages
- [ ] Calculate walk/transit scores
- [ ] Add commute time filter

---

### Priority 3: Crime & Safety

**Data Source:** Police.govt.nz

**Features:**
- Suburb safety ratings
- Crime statistics
- Trend over time

**Tasks:**
- [ ] Import crime data
- [ ] Add safety ratings to suburb pages
- [ ] Add disclaimer (data may be outdated)

---

## 💰 Phase 6: Agent Acquisition (Weeks 13-16)

### Priority 1: Agent Sales Materials

**Tasks:**
- [ ] Create agent pitch deck (PDF)
- [ ] Create demo video (Loom)
- [ ] Build /for-agents landing page
- [ ] Add pricing calculator
- [ ] Create case studies (mock data initially)

---

### Priority 2: Agent Onboarding Funnel

**Flow:**
1. Visit /for-agents
2. Sign up (free trial)
3. Select suburbs
4. Choose tier (Basic/Premium/Seller)
5. Enter payment (Stripe)
6. Onboarding checklist (profile, photo, bio)
7. Activate subscription

**Tasks:**
- [ ] Build /for-agents landing page
- [ ] Create agent signup flow
- [ ] Add suburb selection UI (multi-select)
- [ ] Add tier comparison table
- [ ] Integrate Stripe checkout (already done)
- [ ] Create onboarding checklist

---

### Priority 3: Agent Dashboard Improvements

**Current:** Basic lead inbox

**Add:**
- Lead response time tracker
- Conversion rate metrics
- Monthly lead volume chart
- Competitor comparison (rank in suburb)
- Notification preferences

**Tasks:**
- [ ] Build metrics dashboard
- [ ] Add lead analytics
- [ ] Add performance charts
- [ ] Add email notification settings
- [ ] Add mobile app (PWA)

---

## 🚀 Phase 7: Launch & PR (Week 17)

### Launch Checklist

**Pre-Launch:**
- [ ] Seed 500k+ property valuations
- [ ] Test all critical flows (search, valuation, lead submission)
- [ ] Set up analytics (GA4, Hotjar)
- [ ] Set up error tracking (Sentry)
- [ ] Load test API (k6 or Artillery)

**Launch Day:**
- [ ] Submit to Hacker News ("Show HN: Free NZ property valuations")
- [ ] Post to Reddit (r/newzealand, r/PersonalFinanceNZ)
- [ ] Send press release (NZ Herald, Stuff, NBR)
- [ ] Email 1,000 agents with free trial offer
- [ ] Post to property Facebook groups

**Post-Launch:**
- [ ] Monitor server performance
- [ ] Respond to feedback (HN, Reddit)
- [ ] Fix bugs reported by users
- [ ] Track key metrics (signups, valuations, leads)

---

## 📈 Success Metrics (90-Day Goals)

### Traffic
- **Organic search:** 0 → 10,000 visits/month
- **Direct traffic:** 0 → 1,000 visits/month
- **Pages indexed:** 100,000+

### Engagement
- **Valuations generated:** 10,000+
- **Avg session duration:** >3 minutes
- **Return visitors:** >20%

### Revenue
- **Paying agents:** 10-20
- **MRR:** $5,000-10,000
- **Leads generated:** 500/month

---

## 🎯 Immediate Next Steps (This Week)

### Week 1 Sprint:
1. [ ] Implement /suburb/[slug] pages (2,000+ pages)
2. [ ] Add Schema.org markup to all pages
3. [ ] Generate and submit sitemap
4. [ ] Add social share buttons to /estimate
5. [ ] Build suburb trends chart component
6. [ ] Create /for-agents landing page
7. [ ] Set up analytics (GA4)

**Priority Order:**
1. Suburb pages (biggest SEO impact)
2. Sitemap submission (start indexing)
3. Social sharing (viral loop)
4. /for-agents page (start agent outreach)

---

## 🛠️ Technical Implementation Notes

### Suburb Page Architecture

**SSR Strategy:**
- Use Next.js `generateStaticParams` to pre-render top 500 suburbs
- Use ISR (Incremental Static Regeneration) for the rest
- Revalidate every 24 hours

**Performance:**
- Cache API responses in Redis (60 min TTL)
- Lazy load charts
- Optimize images (Next.js Image)

**SEO:**
- Unique meta descriptions for each suburb
- Include median price in title tag
- Add FAQ schema for common questions

---

### Data Requirements

**New API Endpoints:**
```
GET /api/suburbs/:slug/stats
  → median prices, sales count, trends

GET /api/suburbs/:slug/sales
  → recent sales in suburb

GET /api/suburbs/:slug/agents
  → top agents by performance

GET /api/streets/:suburb/:street/stats
  → street-level statistics
```

**New Database Queries:**
```sql
-- Suburb median prices
SELECT suburb,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY sale_price) as median_price
FROM sales
WHERE sale_date > NOW() - INTERVAL '6 months'
GROUP BY suburb;

-- Suburb trends (month-over-month)
SELECT suburb,
       date_trunc('month', sale_date) as month,
       AVG(sale_price) as avg_price
FROM sales
GROUP BY suburb, month
ORDER BY month DESC;
```

---

## 💡 Key Insights from Zillow Playbook

1. **Accuracy doesn't matter** — Consistency and usefulness matter
2. **Controversy = free PR** — Agents will complain, media will cover
3. **SEO is everything** — Own long-tail search traffic
4. **Consumer trust > agent happiness** — Stay consumer-first
5. **Top-of-funnel focus** — Don't get distracted by transactions

---

## ✅ Done (Previous Phases)

- [x] Backend API (Express, TypeScript, Drizzle ORM)
- [x] Frontend (Next.js, Tailwind, React Query)
- [x] Authentication (BetterAuth)
- [x] Database schema (properties, sales, rentals, leads, agents)
- [x] Heuristic valuation engine
- [x] Lead routing system
- [x] Stripe payment integration
- [x] Data ingestion (LINZ, Council, MBIE)
- [x] Background workers (BullMQ)
- [x] Email notifications (Resend)
- [x] Docker setup (dev + prod)
- [x] CI/CD (GitHub Actions)
- [x] API documentation (Swagger)

---

**Next:** Start with suburb pages this week. This is the highest leverage task for SEO and user acquisition.
