'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Calculator, TrendingUp, MapPin, Home, Search } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';

export default function EstimatePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Search properties as user types
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['property-search', searchTerm],
    queryFn: () => apiClient.searchProperties({ q: searchTerm }),
    enabled: searchTerm.length >= 3,
  });

  // Fetch valuation for selected property
  const {
    data: valuation,
    isLoading: isLoadingValuation,
    error: valuationError,
  } = useQuery({
    queryKey: ['valuation', selectedProperty?.id],
    queryFn: () => apiClient.getValuation(selectedProperty.id),
    enabled: !!selectedProperty?.id,
  });

  const handleSelectProperty = (property: any) => {
    setSelectedProperty(property);
    setSearchTerm(`${property.addressLine1}, ${property.suburb}`);
    setShowResults(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length >= 3);
    if (value.length < 3) {
      setSelectedProperty(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calculator className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Get Your Property Estimate</h1>
          <p className="text-xl text-gray-600">
            Enter your address to receive an instant valuation
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Property Address</h2>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Enter property address (e.g., 123 Beach Road, Albany)..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.length >= 3 && setShowResults(true)}
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchTerm.length >= 3 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching properties...
                  </div>
                ) : searchResults?.properties?.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.properties.map((property: any) => (
                      <button
                        key={property.id}
                        onClick={() => handleSelectProperty(property)}
                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Home className="h-5 w-5 text-primary-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {property.addressLine1}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {property.suburb}, {property.city} {property.postcode}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {property.bedrooms} bed • {property.bathrooms} bath •{' '}
                              {property.floorAreaSqm}m² • {property.propertyType}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No properties found. Try a different address.
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            * Type at least 3 characters to search for properties
          </p>
        </div>

        {/* Property Details & Valuation */}
        {selectedProperty && (
          <div className="space-y-6">
            {/* Property Info Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-xl font-bold">{selectedProperty.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-xl font-bold">{selectedProperty.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floor Area</p>
                  <p className="text-xl font-bold">{selectedProperty.floorAreaSqm}m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="text-xl font-bold">{selectedProperty.yearBuilt || 'N/A'}</p>
                </div>
              </div>

              {selectedProperty.cvValue && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Council Valuation (CV)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-NZ', {
                      style: 'currency',
                      currency: 'NZD',
                      minimumFractionDigits: 0,
                    }).format(selectedProperty.cvValue)}
                  </p>
                </div>
              )}
            </div>

            {/* Valuation Results */}
            {isLoadingValuation ? (
              <div className="card">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : valuationError ? (
              <div className="card bg-red-50 border-red-200">
                <p className="text-red-600">
                  Unable to load valuation. Please try again later.
                </p>
              </div>
            ) : valuation ? (
              <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-12 w-12 text-primary-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Estimated Market Value</h3>
                    <p className="text-4xl font-bold text-primary-600 mb-4">
                      {new Intl.NumberFormat('en-NZ', {
                        style: 'currency',
                        currency: 'NZD',
                        minimumFractionDigits: 0,
                      }).format(valuation.estimateValue)}
                    </p>

                    {valuation.confidenceBandLow && valuation.confidenceBandHigh && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 font-medium">Value Range</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">
                            {new Intl.NumberFormat('en-NZ', {
                              style: 'currency',
                              currency: 'NZD',
                              minimumFractionDigits: 0,
                            }).format(valuation.confidenceBandLow)}
                          </span>
                          <span className="text-gray-400">—</span>
                          <span className="text-gray-600">
                            {new Intl.NumberFormat('en-NZ', {
                              style: 'currency',
                              currency: 'NZD',
                              minimumFractionDigits: 0,
                            }).format(valuation.confidenceBandHigh)}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 mt-4">
                      Estimated on{' '}
                      {new Date(valuation.estimateDate).toLocaleDateString('en-NZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Lead Form */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Connect with a Local Agent</h3>
              <p className="text-gray-600 mb-6">
                Want a more detailed appraisal or ready to sell? Get connected with a
                top-rated agent in {selectedProperty.suburb}.
              </p>
              <LeadForm suburb={selectedProperty.suburb} propertyId={selectedProperty.id} />
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 card bg-primary-600 text-white">
          <h3 className="text-2xl font-bold mb-4">Want a More Accurate Valuation?</h3>
          <p className="mb-6">
            Connect with a local real estate agent for a comprehensive property appraisal
            taking into account recent renovations, local market conditions, and more.
          </p>
          <button className="btn bg-white text-primary-600 hover:bg-gray-100">
            Talk to an Agent
          </button>
        </div>
      </div>
    </div>
  );
}
