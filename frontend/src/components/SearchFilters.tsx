'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (params: any) => void;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    query: '',
    suburb: '',
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};

    if (filters.query) params.query = filters.query;
    if (filters.suburb) params.suburb = filters.suburb;
    if (filters.bedrooms) params.bedrooms = parseInt(filters.bedrooms);
    if (filters.bathrooms) params.bathrooms = parseInt(filters.bathrooms);
    if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            className="input"
            placeholder="Address or keyword..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suburb
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Auckland Central"
            value={filters.suburb}
            onChange={(e) => setFilters({ ...filters, suburb: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <select
            className="input"
            value={filters.bedrooms}
            onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms
          </label>
          <select
            className="input"
            value={filters.bathrooms}
            onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (NZD)
          </label>
          <input
            type="number"
            className="input"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (NZD)
          </label>
          <input
            type="number"
            className="input"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full md:w-auto">
        <Search className="h-4 w-4 inline mr-2" />
        Search Properties
      </button>
    </form>
  );
}
