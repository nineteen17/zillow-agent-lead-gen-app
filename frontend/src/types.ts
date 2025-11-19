export interface CreateLeadInput {
  leadType: 'buyer' | 'seller' | 'rental' | 'mortgage';
  suburb: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  source?: string;
}

export interface Lead {
  id: string;
  leadType: 'buyer' | 'seller' | 'rental' | 'mortgage';
  propertyId: string | null;
  suburb: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  assignedAgentId: string | null;
  status: 'new' | 'delivered' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost';
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  property?: any;
}

export interface AgentMetrics {
  period: string;
  avgResponseTimeSeconds: number | null;
  leadsAssigned: number;
  leadsContacted: number;
  leadsConverted: number;
}

export interface AgentSubscription {
  id: string;
  suburb: string;
  tier: 'basic' | 'premium' | 'seller';
  monthlyPrice: number;
  leadCapPerMonth: number | null;
  activeFrom: string;
  activeTo: string | null;
  isActive: boolean;
}
