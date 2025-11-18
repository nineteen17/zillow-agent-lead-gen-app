import { z } from 'zod';

// Property schemas
export const propertyTypeSchema = z.enum(['house', 'apartment', 'townhouse', 'unit', 'land', 'rural', 'other']);

export const propertySchema = z.object({
  id: z.string(),
  linzAddressId: z.string().nullable(),
  addressLine1: z.string(),
  suburb: z.string(),
  city: z.string(),
  postcode: z.string().nullable(),
  lat: z.string().nullable(),
  lng: z.string().nullable(),
  cvValue: z.number().int().nullable(),
  rvValue: z.number().int().nullable(),
  landAreaSqm: z.number().int().nullable(),
  floorAreaSqm: z.number().int().nullable(),
  yearBuilt: z.number().int().nullable(),
  propertyType: propertyTypeSchema.nullable(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  sourceFlags: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPropertySchema = propertySchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updatePropertySchema = createPropertySchema.partial();

// Property search schema
export const propertySearchSchema = z.object({
  query: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().int().optional(),
  maxPrice: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  propertyType: propertyTypeSchema.optional(),
  page: z.number().int().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Sale schemas
export const saleSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  saleDate: z.date(),
  salePrice: z.number().int(),
  source: z.string().nullable(),
  isInferred: z.boolean(),
  confidenceScore: z.string().nullable(),
  createdAt: z.date(),
});

export const createSaleSchema = saleSchema.omit({ id: true, createdAt: true });

// Rental stats schemas
export const rentalStatsSchema = z.object({
  id: z.string(),
  suburb: z.string(),
  bedrooms: z.number().int().nullable(),
  weeklyRentMedian: z.number().int().nullable(),
  sampleSize: z.number().int().nullable(),
  periodStart: z.date(),
  periodEnd: z.date(),
  createdAt: z.date(),
});

// User schemas
export const userRoleSchema = z.enum(['user', 'agent', 'admin']);

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8).optional(),
  role: userRoleSchema.optional(),
});

// Agent schemas
export const agentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  agencyName: z.string().nullable(),
  licenseNumber: z.string().nullable(),
  regions: z.array(z.string()).nullable(),
  profileBio: z.string().nullable(),
  photoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAgentSchema = agentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateAgentSchema = createAgentSchema.partial().omit({ userId: true });

// Subscription schemas
export const subscriptionTierSchema = z.enum(['basic', 'premium', 'seller']);

export const agentSubscriptionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  suburb: z.string(),
  tier: subscriptionTierSchema,
  monthlyPrice: z.number().int(),
  leadCapPerMonth: z.number().int().nullable(),
  activeFrom: z.date(),
  activeTo: z.date().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createSubscriptionSchema = agentSubscriptionSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Lead schemas
export const leadTypeSchema = z.enum(['buyer', 'seller', 'mortgage', 'rental']);
export const leadStatusSchema = z.enum(['new', 'delivered', 'contacted', 'qualified', 'closed_won', 'closed_lost']);

export const leadSchema = z.object({
  id: z.string(),
  leadType: leadTypeSchema,
  propertyId: z.string().nullable(),
  suburb: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  message: z.string().nullable(),
  source: z.string().nullable(),
  assignedAgentId: z.string().nullable(),
  status: leadStatusSchema,
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createLeadSchema = z.object({
  leadType: leadTypeSchema,
  propertyId: z.string().optional(),
  suburb: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
});

// Agent metrics schemas
export const agentMetricsSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  period: z.string(),
  avgResponseTimeSeconds: z.number().int().nullable(),
  leadsAssigned: z.number().int(),
  leadsContacted: z.number().int(),
  leadsConverted: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Property override schemas
export const propertyOverrideSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  userId: z.string(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  floorAreaSqm: z.number().int().nullable(),
  notes: z.string().nullable(),
  verified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPropertyOverrideSchema = propertyOverrideSchema.omit({ id: true, userId: true, verified: true, createdAt: true, updatedAt: true });

// Valuation schemas
export const valuationSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  estimateValue: z.number().int(),
  estimateDate: z.date(),
  modelVersion: z.string(),
  confidenceBandLow: z.number().int().nullable(),
  confidenceBandHigh: z.number().int().nullable(),
  features: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
});

// Suburb stats schema
export const suburbStatsSchema = z.object({
  suburb: z.string(),
  medianSalePrice: z.number().int().nullable(),
  avgSalePrice: z.number().int().nullable(),
  totalSales: z.number().int(),
  medianRent: z.number().int().nullable(),
  totalProperties: z.number().int(),
});

// Export types
export type Property = z.infer<typeof propertySchema>;
export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type PropertySearch = z.infer<typeof propertySearchSchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export type Sale = z.infer<typeof saleSchema>;
export type CreateSale = z.infer<typeof createSaleSchema>;

export type RentalStats = z.infer<typeof rentalStatsSchema>;

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;

export type Agent = z.infer<typeof agentSchema>;
export type CreateAgent = z.infer<typeof createAgentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;

export type AgentSubscription = z.infer<typeof agentSubscriptionSchema>;
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export type Lead = z.infer<typeof leadSchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatus = z.infer<typeof updateLeadStatusSchema>;
export type LeadType = z.infer<typeof leadTypeSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export type AgentMetrics = z.infer<typeof agentMetricsSchema>;

export type PropertyOverride = z.infer<typeof propertyOverrideSchema>;
export type CreatePropertyOverride = z.infer<typeof createPropertyOverrideSchema>;

export type Valuation = z.infer<typeof valuationSchema>;

export type SuburbStats = z.infer<typeof suburbStatsSchema>;
