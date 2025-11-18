import Link from 'next/link';
import { Property } from '@/types';
import { Bed, Bath, Home, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <Home className="h-16 w-16 text-gray-400" />
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900">
              {property.addressLine1}
            </h3>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.suburb}, {property.city}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} bath</span>
              </div>
            )}
            {property.propertyType && (
              <span className="capitalize">{property.propertyType}</span>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xl font-bold text-primary-600">
              {formatPrice(property.cvValue)}
            </p>
            <p className="text-xs text-gray-500">CV Value</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
