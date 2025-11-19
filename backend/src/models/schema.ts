import { pgTable, text, integer, decimal, timestamp, boolean, varchar, pgEnum, index, uniqueIndex, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const propertyTypeEnum = pgEnum('property_type', ['house', 'apartment', 'townhouse', 'unit', 'land', 'rural', 'other']);
export const leadTypeEnum = pgEnum('lead_type', ['buyer', 'seller', 'mortgage', 'rental']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'delivered', 'contacted', 'qualified', 'closed_won', 'closed_lost']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['basic', 'premium', 'seller']);
export const userRoleEnum = pgEnum('user_role', ['user', 'agent', 'admin']);
export const alertFrequencyEnum = pgEnum('alert_frequency', ['daily', 'weekly', 'monthly']);
export const alertTypeEnum = pgEnum('alert_type', ['price_change', 'new_sales', 'market_trends']);

// Properties table
export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  linzAddressId: varchar('linz_address_id', { length: 100 }),
  addressLine1: text('address_line1').notNull(),
  suburb: varchar('suburb', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postcode: varchar('postcode', { length: 10 }),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  cvValue: integer('cv_value'),
  rvValue: integer('rv_value'),
  landAreaSqm: integer('land_area_sqm'),
  floorAreaSqm: integer('floor_area_sqm'),
  yearBuilt: integer('year_built'),
  propertyType: propertyTypeEnum('property_type'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  sourceFlags: json('source_flags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  suburbIdx: index('properties_suburb_idx').on(table.suburb),
  addressIdx: index('properties_address_idx').on(table.addressLine1),
  locationIdx: index('properties_location_idx').on(table.lat, table.lng),
}));

// Sales table
export const sales = pgTable('sales', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  saleDate: timestamp('sale_date').notNull(),
  salePrice: integer('sale_price').notNull(),
  source: varchar('source', { length: 100 }),
  isInferred: boolean('is_inferred').default(false),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index('sales_property_idx').on(table.propertyId),
  dateIdx: index('sales_date_idx').on(table.saleDate),
}));

// Rental stats table
export const rentalStats = pgTable('rental_stats', {
  id: text('id').primaryKey(),
  suburb: varchar('suburb', { length: 100 }).notNull(),
  bedrooms: integer('bedrooms'),
  weeklyRentMedian: integer('weekly_rent_median'),
  sampleSize: integer('sample_size'),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  suburbIdx: index('rental_stats_suburb_idx').on(table.suburb),
  periodIdx: index('rental_stats_period_idx').on(table.periodStart, table.periodEnd),
}));

// Users table (for BetterAuth)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

// Sessions table (for BetterAuth)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
  expiresIdx: index('sessions_expires_idx').on(table.expiresAt),
}));

// Accounts table (for BetterAuth OAuth)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: varchar('provider_id', { length: 50 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('accounts_user_idx').on(table.userId),
  providerIdx: uniqueIndex('accounts_provider_idx').on(table.providerId, table.accountId),
}));

// Verification tokens table (for BetterAuth)
export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('verification_tokens_token_idx').on(table.token),
}));

// Agents table
export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  agencyName: varchar('agency_name', { length: 255 }),
  licenseNumber: varchar('license_number', { length: 100 }),
  regions: json('regions').$type<string[]>(),
  profileBio: text('profile_bio'),
  photoUrl: text('photo_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: uniqueIndex('agents_user_idx').on(table.userId),
  emailIdx: index('agents_email_idx').on(table.email),
}));

// Agent subscriptions table
export const agentSubscriptions = pgTable('agent_subscriptions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  suburb: varchar('suburb', { length: 100 }).notNull(),
  tier: subscriptionTierEnum('tier').notNull(),
  monthlyPrice: integer('monthly_price').notNull(),
  leadCapPerMonth: integer('lead_cap_per_month'),
  activeFrom: timestamp('active_from').notNull(),
  activeTo: timestamp('active_to'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  agentIdx: index('agent_subscriptions_agent_idx').on(table.agentId),
  suburbIdx: index('agent_subscriptions_suburb_idx').on(table.suburb),
  activeIdx: index('agent_subscriptions_active_idx').on(table.isActive, table.suburb),
}));

// Leads table
export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  leadType: leadTypeEnum('lead_type').notNull(),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
  suburb: varchar('suburb', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  message: text('message'),
  source: varchar('source', { length: 100 }),
  assignedAgentId: text('assigned_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  status: leadStatusEnum('status').default('new').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  agentIdx: index('leads_agent_idx').on(table.assignedAgentId),
  suburbIdx: index('leads_suburb_idx').on(table.suburb),
  statusIdx: index('leads_status_idx').on(table.status),
  createdIdx: index('leads_created_idx').on(table.createdAt),
}));

// Agent metrics table
export const agentMetrics = pgTable('agent_metrics', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  period: varchar('period', { length: 7 }).notNull(), // YYYY-MM format
  avgResponseTimeSeconds: integer('avg_response_time_seconds'),
  leadsAssigned: integer('leads_assigned').default(0),
  leadsContacted: integer('leads_contacted').default(0),
  leadsConverted: integer('leads_converted').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  agentPeriodIdx: uniqueIndex('agent_metrics_agent_period_idx').on(table.agentId, table.period),
}));

// Property overrides table
export const propertyOverrides = pgTable('property_overrides', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  floorAreaSqm: integer('floor_area_sqm'),
  notes: text('notes'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index('property_overrides_property_idx').on(table.propertyId),
  userIdx: index('property_overrides_user_idx').on(table.userId),
}));

// Valuations table
export const valuations = pgTable('valuations', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  estimateValue: integer('estimate_value').notNull(),
  estimateDate: timestamp('estimate_date').notNull(),
  modelVersion: varchar('model_version', { length: 50 }).notNull(),
  confidenceBandLow: integer('confidence_band_low'),
  confidenceBandHigh: integer('confidence_band_high'),
  features: json('features'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index('valuations_property_idx').on(table.propertyId),
  dateIdx: index('valuations_date_idx').on(table.estimateDate),
}));

// Email subscriptions table
export const emailSubscriptions = pgTable('email_subscriptions', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  suburb: varchar('suburb', { length: 100 }),
  frequency: alertFrequencyEnum('frequency').default('weekly').notNull(),
  alertTypes: json('alert_types').$type<string[]>().notNull(), // ['price_change', 'new_sales', 'market_trends']
  isActive: boolean('is_active').default(true).notNull(),
  verificationToken: text('verification_token'),
  verifiedAt: timestamp('verified_at'),
  unsubscribeToken: text('unsubscribe_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_subscriptions_email_idx').on(table.email),
  suburbIdx: index('email_subscriptions_suburb_idx').on(table.suburb),
  activeIdx: index('email_subscriptions_active_idx').on(table.isActive),
  verificationIdx: index('email_subscriptions_verification_idx').on(table.verificationToken),
}));

// Alert history table
export const alertHistory = pgTable('alert_history', {
  id: text('id').primaryKey(),
  subscriptionId: text('subscription_id').notNull().references(() => emailSubscriptions.id, { onDelete: 'cascade' }),
  alertType: alertTypeEnum('alert_type').notNull(),
  suburb: varchar('suburb', { length: 100 }).notNull(),
  data: json('data'), // Store alert-specific data (old price, new price, etc.)
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (table) => ({
  subscriptionIdx: index('alert_history_subscription_idx').on(table.subscriptionId),
  sentIdx: index('alert_history_sent_idx').on(table.sentAt),
  suburbTypeIdx: index('alert_history_suburb_type_idx').on(table.suburb, table.alertType),
}));

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  sales: many(sales),
  valuations: many(valuations),
  propertyOverrides: many(propertyOverrides),
  leads: many(leads),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  property: one(properties, {
    fields: [sales.propertyId],
    references: [properties.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  agent: one(agents, {
    fields: [users.id],
    references: [agents.userId],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  propertyOverrides: many(propertyOverrides),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  subscriptions: many(agentSubscriptions),
  leads: many(leads),
  metrics: many(agentMetrics),
}));

export const agentSubscriptionsRelations = relations(agentSubscriptions, ({ one }) => ({
  agent: one(agents, {
    fields: [agentSubscriptions.agentId],
    references: [agents.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  assignedAgent: one(agents, {
    fields: [leads.assignedAgentId],
    references: [agents.id],
  }),
}));

export const agentMetricsRelations = relations(agentMetrics, ({ one }) => ({
  agent: one(agents, {
    fields: [agentMetrics.agentId],
    references: [agents.id],
  }),
}));

export const propertyOverridesRelations = relations(propertyOverrides, ({ one }) => ({
  property: one(properties, {
    fields: [propertyOverrides.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [propertyOverrides.userId],
    references: [users.id],
  }),
}));

export const valuationsRelations = relations(valuations, ({ one }) => ({
  property: one(properties, {
    fields: [valuations.propertyId],
    references: [properties.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const emailSubscriptionsRelations = relations(emailSubscriptions, ({ many }) => ({
  alerts: many(alertHistory),
}));

export const alertHistoryRelations = relations(alertHistory, ({ one }) => ({
  subscription: one(emailSubscriptions, {
    fields: [alertHistory.subscriptionId],
    references: [emailSubscriptions.id],
  }),
}));

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('password_reset_tokens_token_idx').on(table.token),
  userIdx: index('password_reset_tokens_user_idx').on(table.userId),
}));

// Agent reviews table
export const agentReviews = pgTable('agent_reviews', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(), // 1-5
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  isVerified: boolean('is_verified').default(false),
  isPublished: boolean('is_published').default(true),
  agentResponse: text('agent_response'),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  agentIdx: index('agent_reviews_agent_idx').on(table.agentId),
  leadIdx: index('agent_reviews_lead_idx').on(table.leadId),
  ratingIdx: index('agent_reviews_rating_idx').on(table.rating),
  publishedIdx: index('agent_reviews_published_idx').on(table.isPublished),
}));

// Saved searches table
export const savedSearches = pgTable('saved_searches', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  searchCriteria: json('search_criteria').notNull(), // Store search filters as JSON
  emailAlerts: boolean('email_alerts').default(true),
  alertFrequency: alertFrequencyEnum('alert_frequency').default('daily'),
  lastNotifiedAt: timestamp('last_notified_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('saved_searches_user_idx').on(table.userId),
  activeIdx: index('saved_searches_active_idx').on(table.isActive),
}));

// Saved properties table (favorites)
export const savedProperties = pgTable('saved_properties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  tags: json('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userPropertyIdx: uniqueIndex('saved_properties_user_property_idx').on(table.userId, table.propertyId),
  userIdx: index('saved_properties_user_idx').on(table.userId),
  propertyIdx: index('saved_properties_property_idx').on(table.propertyId),
}));

// Lead conversion funnel tracking table
export const leadConversionEvents = pgTable('lead_conversion_events', {
  id: text('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'created', 'delivered', 'viewed', 'contacted', 'qualified', 'won', 'lost'
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  leadIdx: index('lead_conversion_events_lead_idx').on(table.leadId),
  eventTypeIdx: index('lead_conversion_events_event_type_idx').on(table.eventType),
  createdIdx: index('lead_conversion_events_created_idx').on(table.createdAt),
}));

// A/B test experiments table
export const experiments = pgTable('experiments', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  variants: json('variants').notNull(), // Array of variant configurations
  isActive: boolean('is_active').default(false),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('experiments_active_idx').on(table.isActive),
}));

// A/B test assignments table
export const experimentAssignments = pgTable('experiment_assignments', {
  id: text('id').primaryKey(),
  experimentId: text('experiment_id').notNull().references(() => experiments.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  sessionId: text('session_id'),
  variantId: varchar('variant_id', { length: 100 }).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => ({
  experimentIdx: index('experiment_assignments_experiment_idx').on(table.experimentId),
  userIdx: index('experiment_assignments_user_idx').on(table.userId),
  sessionIdx: index('experiment_assignments_session_idx').on(table.sessionId),
}));

// A/B test events table
export const experimentEvents = pgTable('experiment_events', {
  id: text('id').primaryKey(),
  experimentId: text('experiment_id').notNull().references(() => experiments.id, { onDelete: 'cascade' }),
  assignmentId: text('assignment_id').notNull().references(() => experimentAssignments.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(), // 'page_view', 'button_click', 'conversion', etc.
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  experimentIdx: index('experiment_events_experiment_idx').on(table.experimentId),
  assignmentIdx: index('experiment_events_assignment_idx').on(table.assignmentId),
  eventTypeIdx: index('experiment_events_event_type_idx').on(table.eventType),
}));

// Relations for new tables
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const agentReviewsRelations = relations(agentReviews, ({ one }) => ({
  agent: one(agents, {
    fields: [agentReviews.agentId],
    references: [agents.id],
  }),
  lead: one(leads, {
    fields: [agentReviews.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [agentReviews.userId],
    references: [users.id],
  }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const savedPropertiesRelations = relations(savedProperties, ({ one }) => ({
  user: one(users, {
    fields: [savedProperties.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [savedProperties.propertyId],
    references: [properties.id],
  }),
}));

export const leadConversionEventsRelations = relations(leadConversionEvents, ({ one }) => ({
  lead: one(leads, {
    fields: [leadConversionEvents.leadId],
    references: [leads.id],
  }),
  agent: one(agents, {
    fields: [leadConversionEvents.agentId],
    references: [agents.id],
  }),
}));

export const experimentsRelations = relations(experiments, ({ many }) => ({
  assignments: many(experimentAssignments),
  events: many(experimentEvents),
}));

export const experimentAssignmentsRelations = relations(experimentAssignments, ({ one, many }) => ({
  experiment: one(experiments, {
    fields: [experimentAssignments.experimentId],
    references: [experiments.id],
  }),
  events: many(experimentEvents),
}));

export const experimentEventsRelations = relations(experimentEvents, ({ one }) => ({
  experiment: one(experiments, {
    fields: [experimentEvents.experimentId],
    references: [experiments.id],
  }),
  assignment: one(experimentAssignments, {
    fields: [experimentEvents.assignmentId],
    references: [experimentAssignments.id],
  }),
}));
