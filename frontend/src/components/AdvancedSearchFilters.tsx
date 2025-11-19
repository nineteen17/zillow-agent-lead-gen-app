'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  propertyType?: string;
  minLandArea?: number;
  maxLandArea?: number;
  suburbs?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'bedrooms';
}

interface Props {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export default function AdvancedSearchFilters({ onFilterChange, initialFilters = {} }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Filter size={20} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <div className="flex gap-2">
              <select
                value={filters.minBedrooms || ''}
                onChange={(e) =>
                  handleFilterChange('minBedrooms', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              value={filters.minBathrooms || ''}
              onChange={(e) =>
                handleFilterChange('minBathrooms', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="unit">Unit</option>
              <option value="land">Land</option>
              <option value="rural">Rural</option>
            </select>
          </div>

          {/* Land Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Land Area (sqm)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minLandArea || ''}
                onChange={(e) =>
                  handleFilterChange('minLandArea', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxLandArea || ''}
                onChange={(e) =>
                  handleFilterChange('maxLandArea', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="bedrooms">Most Bedrooms</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
