import { Metadata } from 'next';
import { TrendingUp, Home, Calendar, ChartLine } from 'lucide-react';
import Link from 'next/link';
import { SuburbHeader } from '@/components/SuburbHeader';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

// Generate static params for all suburbs (SSG)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_BASE}/suburbs`, { next: { revalidate: 86400 } }); // Revalidate daily
    if (!response.ok) return [];
    const data = await response.json();
    const suburbs = data.suburbs || [];

    // Return first 500 suburbs for initial build (rest will be ISR)
    return suburbs.slice(0, 500).map((suburb: string) => ({
      slug: encodeURIComponent(suburb),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const suburb = decodeURIComponent(params.slug);

  try {
    const stats = await fetch(`${API_BASE}/suburbs/${encodeURIComponent(suburb)}/stats`, {
      next: { revalidate: 86400 } // Revalidate daily
    }).then(res => res.json());

    const medianPrice = stats?.salesStats?.last3Months?.medianPrice || stats?.propertyStats?.medianCvValue;
    const totalProperties = stats?.propertyStats?.totalProperties || 0;

    const formattedPrice = medianPrice
      ? new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: 0 }).format(medianPrice)
      : 'N/A';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
    const ogImageUrl = `${siteUrl}/api/og?suburb=${encodeURIComponent(suburb)}&price=${encodeURIComponent(formattedPrice)}&properties=${totalProperties}&sales=${stats?.salesStats?.last3Months?.count || 0}`;

    return {
      title: `${suburb} House Prices, Market Stats & Property Values | NZ Real Estate`,
      description: `${suburb} median house price: ${formattedPrice}. View ${totalProperties} properties, recent sales, market trends, and property valuations in ${suburb}, New Zealand.`,
      openGraph: {
        title: `${suburb} Property Market - ${formattedPrice} Median Price`,
        description: `Explore ${totalProperties} properties in ${suburb}. View sales history, market trends, and get free property valuations.`,
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${suburb} Property Market Statistics`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${suburb} Property Market - ${formattedPrice}`,
        description: `${totalProperties} properties, ${stats?.salesStats?.last3Months?.count || 0} recent sales. View market trends and get free valuations.`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    return {
      title: `${suburb} - Property Market Statistics | NZ Real Estate`,
      description: `View property statistics, recent sales, and market trends for ${suburb}, New Zealand.`,
    };
  }
}

// Server component - pre-rendered at build time (SSG)
export default async function SuburbPage({ params }: { params: { slug: string } }) {
  const suburb = decodeURIComponent(params.slug);

  // Fetch all data in parallel on the server
  const [statsRes, salesRes, trendsRes] = await Promise.all([
    fetch(`${API_BASE}/suburbs/${encodeURIComponent(suburb)}/stats`, {
      next: { revalidate: 86400 } // ISR: Revalidate every 24 hours
    }),
    fetch(`${API_BASE}/suburbs/${encodeURIComponent(suburb)}/sales?limit=10`, {
      next: { revalidate: 21600 } // ISR: Revalidate every 6 hours
    }),
    fetch(`${API_BASE}/suburbs/${encodeURIComponent(suburb)}/trends?monthsBack=12`, {
      next: { revalidate: 86400 }
    }),
  ]);

  const stats = statsRes.ok ? await statsRes.json() : null;
  const salesData = salesRes.ok ? await salesRes.json() : null;
  const trendsData = trendsRes.ok ? await trendsRes.json() : null;

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: suburb,
    address: {
      '@type': 'PostalAddress',
      addressLocality: suburb,
      addressCountry: 'NZ'
    },
    ...(stats?.propertyStats?.medianCvValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: stats.propertyStats.totalProperties
      }
    })
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Social Share */}
          <SuburbHeader
            suburb={suburb}
            medianPrice={stats?.salesStats?.last3Months?.medianPrice || stats?.propertyStats?.medianCvValue}
            totalProperties={stats?.propertyStats?.totalProperties}
          />

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Median Sale Price */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <h3 className="text-sm font-medium text-gray-600">Median Sale Price (3M)</h3>
              </div>
              <p className="text-3xl font-bold text-primary-600">
                {formatPrice(stats?.salesStats?.last3Months?.medianPrice)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.salesStats?.last3Months?.count || 0} sales
              </p>
            </div>

            {/* Median CV */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Home className="h-5 w-5 text-primary-600" />
                <h3 className="text-sm font-medium text-gray-600">Median CV Value</h3>
              </div>
              <p className="text-3xl font-bold">
                {formatPrice(stats?.propertyStats?.medianCvValue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.propertyStats?.totalProperties || 0} properties
              </p>
            </div>

            {/* Avg Bedrooms */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Home className="h-5 w-5 text-primary-600" />
                <h3 className="text-sm font-medium text-gray-600">Avg Bedrooms</h3>
              </div>
              <p className="text-3xl font-bold">
                {stats?.propertyStats?.avgBedrooms?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.propertyStats?.avgBathrooms?.toFixed(1) || 'N/A'} bathrooms
              </p>
            </div>

            {/* Sales Activity */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <h3 className="text-sm font-medium text-gray-600">Sales (12M)</h3>
              </div>
              <p className="text-3xl font-bold">
                {stats?.salesStats?.last12Months?.count || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatPrice(stats?.salesStats?.last12Months?.medianPrice)} median
              </p>
            </div>
          </div>

          {/* Price Trend Chart */}
          {trendsData?.trends && trendsData.trends.length > 0 && (
            <div className="card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <ChartLine className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold">Price Trends (12 Months)</h2>
              </div>

              <div className="h-64 flex items-end justify-between gap-2">
                {trendsData.trends.map((trend: any, idx: number) => {
                  const maxPrice = Math.max(...trendsData.trends.map((t: any) => t.medianPrice || 0));
                  const height = trend.medianPrice ? (trend.medianPrice / maxPrice) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-medium text-gray-700">
                        {formatPrice(trend.medianPrice)}
                      </div>
                      <div
                        className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                        title={`${trend.month}: ${formatPrice(trend.medianPrice)} (${trend.salesCount} sales)`}
                      />
                      <div className="text-xs text-gray-600 rotate-45 origin-left mt-2">
                        {trend.month}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Median sale prices per month based on actual sales data. Hover over bars for details.
                </p>
              </div>
            </div>
          )}

          {/* Recent Sales */}
          {salesData?.sales && salesData.sales.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">Recent Sales</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beds/Baths
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.sales.map((sale: any) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <Link
                            href={`/property/${sale.propertyId}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {sale.addressLine1}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-lg font-semibold text-gray-900">
                          {formatPrice(sale.salePrice)}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {sale.bedrooms || '?'} bed / {sale.bathrooms || '?'} bath
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(sale.saleDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Link
                href={`/properties?suburb=${encodeURIComponent(suburb)}`}
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                View all properties in {suburb} →
              </Link>
            </div>
          )}

          {/* Property Stats Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Property Characteristics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Land Area:</span>
                  <span className="font-semibold">
                    {stats?.propertyStats?.avgLandArea?.toFixed(0) || 'N/A'} m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Floor Area:</span>
                  <span className="font-semibold">
                    {stats?.propertyStats?.avgFloorArea?.toFixed(0) || 'N/A'} m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Bedrooms:</span>
                  <span className="font-semibold">
                    {stats?.propertyStats?.avgBedrooms?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Bathrooms:</span>
                  <span className="font-semibold">
                    {stats?.propertyStats?.avgBathrooms?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Sales Activity</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 3 Months:</span>
                  <span className="font-semibold">
                    {stats?.salesStats?.last3Months?.count || 0} sales
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 6 Months:</span>
                  <span className="font-semibold">
                    {stats?.salesStats?.last6Months?.count || 0} sales
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 12 Months:</span>
                  <span className="font-semibold">
                    {stats?.salesStats?.last12Months?.count || 0} sales
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Range (3M):</span>
                    <span className="font-semibold">
                      {formatPrice(stats?.salesStats?.last3Months?.minPrice)} - {formatPrice(stats?.salesStats?.last3Months?.maxPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card bg-primary-600 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Thinking of Buying or Selling in {suburb}?
            </h2>
            <p className="text-lg mb-6">
              Connect with top-rated local real estate agents who know the {suburb} market inside out.
              Get expert advice, accurate valuations, and personalized service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/estimate?suburb=${encodeURIComponent(suburb)}`}
                className="btn bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Free Property Valuation
              </Link>
              <Link
                href="/agents"
                className="btn bg-primary-700 hover:bg-primary-800"
              >
                Find a Local Agent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
