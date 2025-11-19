'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, Home, X } from 'lucide-react';

export default function ComparePage() {
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all suburbs for autocomplete
  const { data: suburbsData } = useQuery({
    queryKey: ['all-suburbs'],
    queryFn: () => apiClient.getAllSuburbs(),
  });

  const suburbs = suburbsData?.suburbs || [];

  // Fetch stats for selected suburbs
  const suburbQueries = selectedSuburbs.map((suburb) =>
    useQuery({
      queryKey: ['suburb-stats', suburb],
      queryFn: () => apiClient.getSuburbStats(suburb),
      enabled: !!suburb,
    })
  );

  const filteredSuburbs = suburbs.filter((suburb) =>
    suburb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addSuburb = (suburb: string) => {
    if (selectedSuburbs.length < 3 && !selectedSuburbs.includes(suburb)) {
      setSelectedSuburbs([...selectedSuburbs, suburb]);
      setSearchTerm('');
    }
  };

  const removeSuburb = (suburb: string) => {
    setSelectedSuburbs(selectedSuburbs.filter((s) => s !== suburb));
  };

  const formatPrice = (price: number | null | undefined) => {
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
          <h1 className="text-4xl font-bold mb-4">Compare Suburbs</h1>
          <p className="text-xl text-gray-600">
            Compare property market statistics across different suburbs
          </p>
        </div>

        {/* Suburb Selector */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Select Suburbs to Compare (Max 3)</h2>

          {/* Selected suburbs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSuburbs.map((suburb) => (
              <div
                key={suburb}
                className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg"
              >
                <span className="font-medium">{suburb}</span>
                <button
                  onClick={() => removeSuburb(suburb)}
                  className="hover:bg-primary-200 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Search input */}
          {selectedSuburbs.length < 3 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search suburbs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              {/* Autocomplete dropdown */}
              {searchTerm && filteredSuburbs.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredSuburbs.slice(0, 10).map((suburb) => (
                    <button
                      key={suburb}
                      onClick={() => addSuburb(suburb)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      disabled={selectedSuburbs.includes(suburb)}
                    >
                      {suburb}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedSuburbs.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Metric
                  </th>
                  {selectedSuburbs.map((suburb) => (
                    <th
                      key={suburb}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                    >
                      {suburb}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Median Sale Price (3M) */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary-600" />
                      Median Sale Price (3M)
                    </div>
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded" />
                      ) : (
                        <span className="text-lg font-semibold text-primary-600">
                          {formatPrice(query.data?.salesStats?.last3Months?.medianPrice)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Median CV Value */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary-600" />
                      Median CV Value
                    </div>
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded" />
                      ) : (
                        <span className="text-lg font-semibold">
                          {formatPrice(query.data?.propertyStats?.medianCvValue)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Total Properties */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Total Properties
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-24 rounded" />
                      ) : (
                        <span>{query.data?.propertyStats?.totalProperties || 0}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Sales (3M) */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Recent Sales (3M)
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded" />
                      ) : (
                        <span>{query.data?.salesStats?.last3Months?.count || 0} sales</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Sales (12M) */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Sales (12M)
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded" />
                      ) : (
                        <span>{query.data?.salesStats?.last12Months?.count || 0} sales</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Avg Bedrooms */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Average Bedrooms
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-12 rounded" />
                      ) : (
                        <span>{query.data?.propertyStats?.avgBedrooms?.toFixed(1) || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Avg Bathrooms */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Average Bathrooms
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-12 rounded" />
                      ) : (
                        <span>{query.data?.propertyStats?.avgBathrooms?.toFixed(1) || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Avg Land Area */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Average Land Area
                  </td>
                  {suburbQueries.map((query, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm">
                      {query.isLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded" />
                      ) : (
                        <span>
                          {query.data?.propertyStats?.avgLandArea?.toFixed(0) || 'N/A'} m²
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {selectedSuburbs.length === 0 && (
          <div className="card text-center py-12">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No suburbs selected
            </h3>
            <p className="text-gray-600">
              Search and select up to 3 suburbs to compare their market statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
