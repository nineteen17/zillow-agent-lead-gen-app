'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  suburb: string;
  tier: 'basic' | 'premium' | 'seller';
  monthlyPrice: number;
  leadCapPerMonth: number;
  isActive: boolean;
  createdAt: string;
}

const TIER_LABELS = {
  basic: 'Basic',
  premium: 'Premium',
  seller: 'Seller Plus',
};

const TIER_COLORS = {
  basic: 'bg-gray-100 text-gray-800',
  premium: 'bg-blue-100 text-blue-800',
  seller: 'bg-purple-100 text-purple-800',
};

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'seller'>('premium');
  const [availableSuburbs, setAvailableSuburbs] = useState<string[]>([]);

  useEffect(() => {
    loadSubscriptions();
    loadAvailableSuburbs();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/agent/subscriptions`, {
        credentials: 'include',
      });
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSuburbs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/available-suburbs`);
      const data = await response.json();
      setAvailableSuburbs(data);
    } catch (error) {
      console.error('Error loading suburbs:', error);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedSuburb) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/add-suburb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ suburb: selectedSuburb, tier: selectedTier }),
      });

      if (!response.ok) throw new Error('Failed to add subscription');

      await loadSubscriptions();
      setShowAddModal(false);
      setSelectedSuburb('');
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Failed to add subscription');
    }
  };

  const handleRemoveSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to remove subscription');

      await loadSubscriptions();
    } catch (error) {
      console.error('Error removing subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleChangeTier = async (subscriptionId: string, newTier: 'basic' | 'premium' | 'seller') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/change-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscriptionId, newTier }),
      });

      if (!response.ok) throw new Error('Failed to change tier');

      await loadSubscriptions();
    } catch (error) {
      console.error('Error changing tier:', error);
      alert('Failed to change tier');
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const totalMRR = activeSubscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0);

  if (loading) {
    return <div className="text-center py-8">Loading subscriptions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Subscriptions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Monthly: ${(totalMRR / 100).toFixed(2)} • {activeSubscriptions.length} Active Suburbs
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Suburb
        </button>
      </div>

      {activeSubscriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No active subscriptions. Add a suburb to start receiving leads.
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubscriptions.map(subscription => (
            <div
              key={subscription.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{subscription.suburb}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        TIER_COLORS[subscription.tier]
                      }`}
                    >
                      {TIER_LABELS[subscription.tier]}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>${(subscription.monthlyPrice / 100).toFixed(0)}/month</span>
                    <span>•</span>
                    <span>{subscription.leadCapPerMonth} leads/month</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={subscription.tier}
                    onChange={(e) =>
                      handleChangeTier(subscription.id, e.target.value as any)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="basic">Basic - $199/mo</option>
                    <option value="premium">Premium - $399/mo</option>
                    <option value="seller">Seller Plus - $599/mo</option>
                  </select>
                  <button
                    onClick={() => handleRemoveSubscription(subscription.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Cancel subscription"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Suburb Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add New Suburb</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suburb
                </label>
                <select
                  value={selectedSuburb}
                  onChange={(e) => setSelectedSuburb(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a suburb</option>
                  {availableSuburbs.map(suburb => (
                    <option key={suburb} value={suburb}>
                      {suburb}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="basic">Basic - $199/mo (10 leads)</option>
                  <option value="premium">Premium - $399/mo (50 leads)</option>
                  <option value="seller">Seller Plus - $599/mo (999 leads)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubscription}
                  disabled={!selectedSuburb}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
