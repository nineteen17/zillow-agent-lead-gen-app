'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, Clock } from 'lucide-react';

interface Analytics {
  period: string;
  totalLeads: number;
  contacted: number;
  qualified: number;
  won: number;
  contactRate: number;
  qualificationRate: number;
  conversionRate: number;
  avgResponseTimeHours: number;
  sourceBreakdown: Record<string, number>;
}

interface ConversionFunnelData {
  eventType: string;
  count: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnelData[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadConversionFunnel();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/analytics/agent/performance?period=${period}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversionFunnel = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/analytics/agent/funnel`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setFunnel(data);
    } catch (error) {
      console.error('Error loading funnel:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>;
  }

  const stats = [
    {
      label: 'Total Leads',
      value: analytics.totalLeads,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Contact Rate',
      value: `${analytics.contactRate}%`,
      icon: Target,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Avg Response Time',
      value: `${analytics.avgResponseTimeHours}h`,
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Conversion Funnel</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-700">Total Leads</span>
            <div className="flex items-center gap-4">
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="font-semibold w-12 text-right">{analytics.totalLeads}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-700">Contacted</span>
            <div className="flex items-center gap-4">
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${analytics.contactRate}%` }}
                />
              </div>
              <span className="font-semibold w-12 text-right">{analytics.contacted}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-gray-700">Qualified</span>
            <div className="flex items-center gap-4">
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full"
                  style={{
                    width: `${
                      analytics.totalLeads > 0
                        ? (analytics.qualified / analytics.totalLeads) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="font-semibold w-12 text-right">{analytics.qualified}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-700">Won</span>
            <div className="flex items-center gap-4">
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${analytics.conversionRate}%` }}
                />
              </div>
              <span className="font-semibold w-12 text-right">{analytics.won}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Source Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
        {Object.keys(analytics.sourceBreakdown).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(analytics.sourceBreakdown).map(([source, count]) => {
              const percentage =
                analytics.totalLeads > 0 ? (count / analytics.totalLeads) * 100 : 0;
              return (
                <div key={source} className="flex items-center gap-4">
                  <span className="text-gray-700 w-32 capitalize">{source}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-semibold w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No lead source data available</p>
        )}
      </div>
    </div>
  );
}
