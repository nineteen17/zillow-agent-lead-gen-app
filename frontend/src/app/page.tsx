'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchFilters } from '@/components/SearchFilters';
import { Home, TrendingUp, Users, Search } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['properties', searchParams],
    queryFn: () => apiClient.searchProperties(searchParams),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect Property in New Zealand
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Search properties, get instant valuations, connect with local agents
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comprehensive Search</h3>
              <p className="text-gray-600">Browse thousands of properties across New Zealand</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Valuations</h3>
              <p className="text-gray-600">Get accurate property estimates instantly</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Local Agents</h3>
              <p className="text-gray-600">Connect with experienced local real estate professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Search Properties</h2>
          <SearchFilters onSearch={setSearchParams} />

          {/* Results */}
          <div className="mt-12">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            )}

            {data && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    {data.pagination.total} Properties Found
                  </h3>
                  <p className="text-gray-600">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((property: any) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {data.items.length === 0 && (
                  <div className="text-center py-12">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                    <p className="text-gray-600">Try adjusting your search filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
