const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies/sessions
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Properties
  async searchProperties(params: Record<string, any>) {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    );
    return this.request(`/properties/search?${query}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  // Valuations
  async getValuation(propertyId: string) {
    return this.request(`/valuations/${propertyId}`);
  }

  async computeValuation(propertyId: string) {
    return this.request(`/valuations/${propertyId}/compute`, {
      method: 'POST',
    });
  }

  // Suburbs
  async getSuburbStats(suburb: string) {
    return this.request(`/suburbs/${encodeURIComponent(suburb)}/stats`);
  }

  // Leads
  async createLead(data: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Agent endpoints
  async getAgentProfile() {
    return this.request('/agent/me');
  }

  async getAgentLeads(params?: { page?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/agent/leads${query}`);
  }

  async updateLeadStatus(leadId: string, status: string) {
    return this.request(`/agent/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAgentSubscriptions() {
    return this.request('/agent/subscriptions');
  }

  async getAgentMetrics(period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/agent/metrics${query}`);
  }
}

export const apiClient = new ApiClient();
