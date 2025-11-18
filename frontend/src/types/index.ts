import { z } from 'zod';

// Re-export schemas from backend for type safety
// These should match the backend zod-schemas.ts

export const propertyTypeSchema = z.enum(['house', 'apartment', 'townhouse', 'unit', 'land', 'rural', 'other']);
export const leadTypeSchema = z.enum(['buyer', 'seller', 'mortgage', 'rental']);
export const leadStatusSchema = z.enum(['new', 'delivered', 'contacted', 'qualified', 'closed_won', 'closed_lost']);
export const subscriptionTierSchema = z.enum(['basic', 'premium', 'seller']);
export const userRoleSchema = z.enum(['user', 'agent', 'admin']);

// Property types
export interface Property {
  id: string;
  linzAddressId: string | null;
  addressLine1: string;
  suburb: string;
  city: string;
  postcode: string | null;
  lat: string | null;
  lng: string | null;
  cvValue: number | null;
  rvValue: number | null;
  landAreaSqm: number | null;
  floorAreaSqm: number | null;
  yearBuilt: number | null;
  propertyType: z.infer<typeof propertyTypeSchema> | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sourceFlags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertySearchParams {
  query?: string;
  suburb?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: z.infer<typeof propertyTypeSchema>;
  page?: number;
  limit?: number;
}

// Valuation types
export interface Valuation {
  id: string;
  propertyId: string;
  estimateValue: number;
  estimateDate: Date;
  modelVersion: string;
  confidenceBandLow: number | null;
  confidenceBandHigh: number | null;
  features: Record<string, unknown> | null;
  createdAt: Date;
}

// Lead types
export interface Lead {
  id: string;
  leadType: z.infer<typeof leadTypeSchema>;
  propertyId: string | null;
  suburb: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  assignedAgentId: string | null;
  status: z.infer<typeof leadStatusSchema>;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadInput {
  leadType: z.infer<typeof leadTypeSchema>;
  propertyId?: string;
  suburb: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

// Agent types
export interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  agencyName: string | null;
  licenseNumber: string | null;
  regions: string[] | null;
  profileBio: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSubscription {
  id: string;
  agentId: string;
  suburb: string;
  tier: z.infer<typeof subscriptionTierSchema>;
  monthlyPrice: number;
  leadCapPerMonth: number | null;
  activeFrom: Date;
  activeTo: Date | null;
  stripeSubscriptionId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetrics {
  id: string;
  agentId: string;
  period: string;
  avgResponseTimeSeconds: number | null;
  leadsAssigned: number;
  leadsContacted: number;
  leadsConverted: number;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: z.infer<typeof userRoleSchema>;
  createdAt: Date;
  updatedAt: Date;
}

// Suburb stats
export interface SuburbStats {
  suburb: string;
  propertyStats: {
    totalProperties: number;
    avgCvValue: number | null;
    medianCvValue: number | null;
  } | null;
  salesStats: {
    totalSales: number;
    medianPrice: number | null;
    avgPrice: number | null;
  };
  rentalStats: {
    id: string;
    suburb: string;
    bedrooms: number | null;
    weeklyRentMedian: number | null;
    sampleSize: number | null;
    periodStart: Date;
    periodEnd: Date;
  } | null;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
