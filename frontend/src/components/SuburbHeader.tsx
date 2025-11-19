'use client';

import { MapPin } from 'lucide-react';
import { SocialShare } from './SocialShare';

interface SuburbHeaderProps {
  suburb: string;
  medianPrice?: number;
  totalProperties?: number;
}

export function SuburbHeader({ suburb, medianPrice, totalProperties }: SuburbHeaderProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `${siteUrl}/suburb/${encodeURIComponent(suburb)}`;

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shareTitle = `${suburb} Property Market - ${formatPrice(medianPrice)} Median Price`;
  const shareDescription = `Check out ${suburb}'s property market! ${totalProperties || 0} properties, median price ${formatPrice(medianPrice)}. View recent sales, trends, and get free valuations.`;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary-600" />
          <h1 className="text-4xl font-bold">{suburb}</h1>
        </div>
        <SocialShare
          url={currentUrl}
          title={shareTitle}
          description={shareDescription}
          hashtags={['NZProperty', 'RealEstate', suburb.replace(/\s+/g, '')]}
        />
      </div>
      <p className="text-xl text-gray-600">Market Statistics & Property Insights</p>
    </div>
  );
}
