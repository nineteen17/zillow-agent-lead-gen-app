'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, Users, Mail, Phone, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';

export default function AgentDashboard() {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: () => apiClient.getAgentProfile(),
  });

  const { data: leads } = useQuery({
    queryKey: ['agent-leads'],
    queryFn: () => apiClient.getAgentLeads(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['agent-metrics'],
    queryFn: () => apiClient.getAgentMetrics(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      apiClient.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-leads'] });
      queryClient.invalidateQueries({ queryKey: ['agent-metrics'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>

        {/* Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Leads Assigned</p>
                  <p className="text-2xl font-bold">{metrics.leadsAssigned}</p>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contacted</p>
                  <p className="text-2xl font-bold">{metrics.leadsContacted}</p>
                </div>
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Converted</p>
                  <p className="text-2xl font-bold">{metrics.leadsConverted}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">
                    {metrics.avgResponseTimeSeconds
                      ? `${Math.round(metrics.avgResponseTimeSeconds / 3600)}h`
                      : 'N/A'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Suburb</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Received</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads?.leads?.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{lead.name}</td>
                    <td className="py-3 px-4 capitalize">{lead.leadType}</td>
                    <td className="py-3 px-4">{lead.suburb}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'closed_won'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDistance(new Date(lead.createdAt), new Date(), { addSuffix: true })}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        value={lead.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            leadId: lead.id,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed_won">Won</option>
                        <option value="closed_lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!leads?.leads || leads.leads.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                No leads yet. They'll appear here when you receive them.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
