'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LeadForm } from '@/components/LeadForm';
import { SocialShare } from '@/components/SocialShare';
import { Bed, Bath, Home as HomeIcon, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { use } from 'react';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => apiClient.getProperty(id),
  });

  const { data: valuation } = useQuery({
    queryKey: ['valuation', id],
    queryFn: () => apiClient.getValuation(id),
    enabled: !!property,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-600">The property you&apos;re looking for doesn&apos;t exist.</p>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <HomeIcon className="h-32 w-32 text-gray-400" />
            </div>

            {/* Property Info */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.addressLine1}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-1" />
                    {property.suburb}, {property.city} {property.postcode}
                  </div>
                </div>
                <SocialShare
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={`${property.addressLine1} - ${formatPrice(valuation?.estimateValue || property.cvValue)}`}
                  description={`${property.bedrooms || 0} bed, ${property.bathrooms || 0} bath ${property.propertyType} in ${property.suburb}`}
                  hashtags={['NZProperty', 'RealEstate', property.suburb.replace(/\s+/g, '')]}
                />
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">{property.bedrooms}</span> bedrooms
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">{property.bathrooms}</span> bathrooms
                  </div>
                )}
                {property.floorAreaSqm && (
                  <div>
                    <span className="font-semibold">{property.floorAreaSqm}</span> sqm floor
                  </div>
                )}
                {property.landAreaSqm && (
                  <div>
                    <span className="font-semibold">{property.landAreaSqm}</span> sqm land
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Property Type</h3>
                  <p className="text-lg capitalize">{property.propertyType || 'N/A'}</p>
                </div>

                {property.yearBuilt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Year Built</h3>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {property.yearBuilt}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700">CV Value</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(property.cvValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Valuation */}
            {valuation && (
              <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Estimated Value</h3>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatPrice(valuation.estimateValue)}
                    </p>
                    {valuation.confidenceBandLow && valuation.confidenceBandHigh && (
                      <p className="text-sm text-gray-600 mt-1">
                        Range: {formatPrice(valuation.confidenceBandLow)} - {formatPrice(valuation.confidenceBandHigh)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Model: {valuation.modelVersion}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Disclaimer:</strong> This is an automated estimate based on public records and suburb trends.
                    It is not an appraisal. For a professional valuation, speak with a licensed real estate agent.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <LeadForm propertyId={property.id} suburb={property.suburb} />
          </div>
        </div>
      </div>
    </div>
  );
}
