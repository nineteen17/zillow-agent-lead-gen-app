'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Lead } from '@/types';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  User,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

type LeadStatus = 'new' | 'delivered' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost';

export default function AgentDashboard() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');

  // Fetch agent profile
  const { data: agent } = useQuery({
    queryKey: ['agent', 'me'],
    queryFn: () => apiClient.getAgentProfile(),
  });

  // Fetch agent leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['agent', 'leads'],
    queryFn: () => apiClient.getAgentLeads(),
  });

  // Fetch agent metrics
  const { data: metricsData } = useQuery({
    queryKey: ['agent', 'metrics'],
    queryFn: () => apiClient.getAgentMetrics(),
  });

  // Fetch agent subscriptions
  const { data: subscriptionsData } = useQuery({
    queryKey: ['agent', 'subscriptions'],
    queryFn: () => apiClient.getAgentSubscriptions(),
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      apiClient.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'leads'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'metrics'] });
    },
  });

  const leads: Lead[] = leadsData?.leads || [];
  const filteredLeads = selectedStatus === 'all'
    ? leads
    : leads.filter(lead => lead.status === selectedStatus);

  const metrics = metricsData || {
    leadsAssigned: 0,
    leadsContacted: 0,
    leadsConverted: 0,
  };

  const conversionRate = metrics.leadsAssigned > 0
    ? ((metrics.leadsConverted / metrics.leadsAssigned) * 100).toFixed(1)
    : '0.0';

  const contactRate = metrics.leadsAssigned > 0
    ? ((metrics.leadsContacted / metrics.leadsAssigned) * 100).toFixed(1)
    : '0.0';

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    delivered: 'bg-indigo-100 text-indigo-800',
    contacted: 'bg-purple-100 text-purple-800',
    qualified: 'bg-yellow-100 text-yellow-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    new: 'New',
    delivered: 'Delivered',
    contacted: 'Contacted',
    qualified: 'Qualified',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  };

  const handleStatusChange = (leadId: string, status: string) => {
    updateStatusMutation.mutate({ leadId, status });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {agent?.name || 'Agent'}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.leadsAssigned}</p>
              </div>
              <User className="h-10 w-10 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.leadsContacted}</p>
                <p className="text-xs text-gray-500 mt-1">{contactRate}% rate</p>
              </div>
              <Phone className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.leadsConverted}</p>
                <p className="text-xs text-gray-500 mt-1">{conversionRate}% rate</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Suburbs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {subscriptionsData?.length || 0}
                </p>
              </div>
              <MapPin className="h-10 w-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        {subscriptionsData && subscriptionsData.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Your Active Suburbs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionsData.map((sub: any) => (
                <div key={sub.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{sub.suburb}</p>
                      <p className="text-sm text-gray-600 capitalize">{sub.tier} Plan</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${sub.monthlyPrice}/month
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Leads</h2>

            {/* Status Filter */}
            <select
              className="input w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="delivered">Delivered</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No leads yet</p>
              <p className="text-gray-500 text-sm mt-1">
                You'll receive your first leads within 48 hours
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                          {lead.leadType}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${lead.email}`} className="hover:text-primary-600">
                            {lead.email}
                          </a>
                        </div>

                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${lead.phone}`} className="hover:text-primary-600">
                              {lead.phone}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{lead.suburb}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {lead.message && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {lead.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {lead.status === 'new' || lead.status === 'delivered' ? (
                      <button
                        onClick={() => handleStatusChange(lead.id, 'contacted')}
                        className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Contacted
                      </button>
                    ) : lead.status === 'contacted' ? (
                      <button
                        onClick={() => handleStatusChange(lead.id, 'qualified')}
                        className="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Qualified
                      </button>
                    ) : lead.status === 'qualified' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(lead.id, 'closed_won')}
                          className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark as Won
                        </button>
                        <button
                          onClick={() => handleStatusChange(lead.id, 'closed_lost')}
                          className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark as Lost
                        </button>
                      </>
                    ) : null}

                    {lead.propertyId && (
                      <Link
                        href={`/property/${lead.propertyId}`}
                        className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-900"
                      >
                        View Property
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
