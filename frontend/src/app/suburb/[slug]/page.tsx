'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MapPin, TrendingUp, Home, DollarSign } from 'lucide-react';
import { use } from 'react';

export default function SuburbPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const suburb = decodeURIComponent(slug);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['suburb-stats', suburb],
    queryFn: () => apiClient.getSuburbStats(suburb),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-primary-600" />
            <h1 className="text-4xl font-bold">{suburb}</h1>
          </div>
          <p className="text-xl text-gray-600">Market Statistics & Insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Stats */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Home className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">Property Overview</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">
                  {stats?.propertyStats?.totalProperties || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Median CV Value</p>
                <p className="text-xl font-semibold text-primary-600">
                  {formatPrice(stats?.propertyStats?.medianCvValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average CV Value</p>
                <p className="text-lg">
                  {formatPrice(stats?.propertyStats?.avgCvValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Sales Stats */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">Recent Sales</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">
                  {stats?.salesStats?.totalSales || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Median Sale Price</p>
                <p className="text-xl font-semibold text-primary-600">
                  {formatPrice(stats?.salesStats?.medianPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Sale Price</p>
                <p className="text-lg">
                  {formatPrice(stats?.salesStats?.avgPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Stats */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold">Rental Market</h3>
            </div>
            <div className="space-y-3">
              {stats?.rentalStats ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Median Weekly Rent</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(stats.rentalStats.weeklyRentMedian)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sample Size</p>
                    <p className="text-lg">
                      {stats.rentalStats.sampleSize} properties
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No rental data available</p>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 card bg-primary-600 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Looking to Buy or Sell in {suburb}?
          </h3>
          <p className="mb-6">
            Connect with experienced local agents who know the {suburb} market inside out.
          </p>
          <button className="btn bg-white text-primary-600 hover:bg-gray-100">
            Talk to a Local Agent
          </button>
        </div>
      </div>
    </div>
  );
}
