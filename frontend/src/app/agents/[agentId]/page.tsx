'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Building, Phone, Mail } from 'lucide-react';

interface AgentProfile {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    agencyName: string;
    licenseNumber: string;
    profileBio: string;
    photoUrl: string;
    createdAt: string;
  };
  suburbs: string[];
  ratingStats: {
    totalReviews: number;
    averageRating: number;
    rating5: number;
    rating4: number;
    rating3: number;
    rating2: number;
    rating1: number;
  };
  reviews: Array<{
    id: string;
    rating: number;
    title: string;
    comment: string;
    agentResponse: string;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/agents/${agentId}/profile`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading profile:', err);
        setLoading(false);
      });
  }, [agentId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Agent not found</div>;
  }

  const { agent, suburbs, ratingStats, reviews } = profile;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {agent.photoUrl ? (
                <img
                  src={agent.photoUrl}
                  alt={agent.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-4xl text-blue-600 font-bold">
                    {agent.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              {agent.licenseNumber && (
                <p className="text-gray-600 mt-1">License #{agent.licenseNumber}</p>
              )}
              {agent.agencyName && (
                <div className="flex items-center gap-2 mt-2 text-gray-700">
                  <Building size={18} />
                  <span>{agent.agencyName}</span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Phone size={18} />
                    {agent.phone}
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Mail size={18} />
                    Contact
                  </a>
                )}
              </div>
              {/* Rating */}
              {ratingStats.totalReviews > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i <= ratingStats.averageRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{ratingStats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">({ratingStats.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
          {agent.profileBio && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-line">{agent.profileBio}</p>
            </div>
          )}
        </div>

        {/* Suburbs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Service Areas</h3>
          <div className="flex flex-wrap gap-2">
            {suburbs.map(suburb => (
              <div
                key={suburb}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <MapPin size={14} />
                {suburb}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6">Reviews</h3>

            {/* Rating breakdown */}
            <div className="mb-8 pb-6 border-b">
              <div className="grid grid-cols-5 gap-2 max-w-md">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = (ratingStats as any)[`rating${rating}`];
                  const percentage =
                    ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="col-span-5 flex items-center gap-2">
                      <span className="text-sm w-12">{rating} star</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.user.name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-700">{review.comment}</p>
                      {review.agentResponse && (
                        <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            Response from {agent.name}
                          </p>
                          <p className="text-sm text-gray-700">{review.agentResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
