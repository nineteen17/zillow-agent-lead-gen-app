'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Check, X, Search } from 'lucide-react';

export default function AgentSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = (searchParams.get('tier') as 'basic' | 'premium' | 'seller') || 'premium';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    agencyName: '',
    licenseNumber: '',
    tier: initialTier,
    suburbs: [] as string[],
  });
  const [suburbSearch, setSuburbSearch] = useState('');

  // Fetch all suburbs
  const { data: suburbsData } = useQuery({
    queryKey: ['all-suburbs'],
    queryFn: () => apiClient.getAllSuburbs(),
  });

  const suburbs = suburbsData?.suburbs || [];
  const filteredSuburbs = suburbs.filter(
    (suburb) =>
      suburb.toLowerCase().includes(suburbSearch.toLowerCase()) &&
      !formData.suburbs.includes(suburb)
  );

  const pricingTiers = {
    basic: { name: 'Basic', price: 199, maxSuburbs: 2 },
    premium: { name: 'Premium', price: 399, maxSuburbs: 5 },
    seller: { name: 'Seller Plus', price: 599, maxSuburbs: 10 },
  };

  const currentTier = pricingTiers[formData.tier];

  const addSuburb = (suburb: string) => {
    if (formData.suburbs.length < currentTier.maxSuburbs) {
      setFormData({ ...formData, suburbs: [...formData.suburbs, suburb] });
      setSuburbSearch('');
    }
  };

  const removeSuburb = (suburb: string) => {
    setFormData({
      ...formData,
      suburbs: formData.suburbs.filter((s) => s !== suburb),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Validate step 1
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate step 2
      if (formData.suburbs.length === 0) {
        alert('Please select at least one suburb');
        return;
      }
      setStep(3);
    } else {
      // Final step - Create Stripe checkout session
      try {
        // Here you would call your Stripe checkout API
        // For now, just redirect to a success page
        alert('Signup complete! Redirecting to payment...');
        // router.push('/agent/dashboard');
      } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 gap-24">
            <span className={step >= 1 ? 'text-primary-600 font-semibold' : 'text-gray-500'}>
              Your Details
            </span>
            <span className={step >= 2 ? 'text-primary-600 font-semibold' : 'text-gray-500'}>
              Choose Suburbs
            </span>
            <span className={step >= 3 ? 'text-primary-600 font-semibold' : 'text-gray-500'}>
              Review & Pay
            </span>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Agent Details */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Your Details</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="021 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Premium Realty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="REAA123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Choose Your Plan *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(pricingTiers).map(([key, tier]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              tier: key as 'basic' | 'premium' | 'seller',
                              suburbs: [],
                            })
                          }
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            formData.tier === key
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-bold text-lg mb-1">{tier.name}</div>
                          <div className="text-2xl font-bold text-primary-600 mb-1">
                            ${tier.price}
                          </div>
                          <div className="text-sm text-gray-600">
                            Up to {tier.maxSuburbs} suburbs
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="submit" className="btn bg-primary-600 hover:bg-primary-700 text-white px-8">
                    Next: Choose Suburbs
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Choose Suburbs */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Suburbs</h2>
                <p className="text-gray-600 mb-6">
                  Select up to {currentTier.maxSuburbs} suburbs where you want to receive leads
                </p>

                {/* Selected Suburbs */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Selected Suburbs ({formData.suburbs.length}/{currentTier.maxSuburbs})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.suburbs.map((suburb) => (
                      <div
                        key={suburb}
                        className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg"
                      >
                        <span className="font-medium">{suburb}</span>
                        <button
                          type="button"
                          onClick={() => removeSuburb(suburb)}
                          className="hover:bg-primary-200 rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.suburbs.length === 0 && (
                      <div className="text-gray-500 italic">No suburbs selected yet</div>
                    )}
                  </div>
                </div>

                {/* Suburb Search */}
                {formData.suburbs.length < currentTier.maxSuburbs && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Suburbs
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={suburbSearch}
                        onChange={(e) => setSuburbSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Search suburbs..."
                      />
                    </div>

                    {/* Autocomplete Results */}
                    {suburbSearch && filteredSuburbs.length > 0 && (
                      <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredSuburbs.slice(0, 10).map((suburb) => (
                          <button
                            key={suburb}
                            type="button"
                            onClick={() => addSuburb(suburb)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                          >
                            <span>{suburb}</span>
                            <span className="text-sm text-primary-600">Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={formData.suburbs.length === 0}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Review & Pay
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Payment */}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Review Your Details</h2>

                <div className="space-y-6 mb-8">
                  {/* Agent Info */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Agent Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Name</div>
                        <div className="font-medium">{formData.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Email</div>
                        <div className="font-medium">{formData.email}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Phone</div>
                        <div className="font-medium">{formData.phone}</div>
                      </div>
                      {formData.agencyName && (
                        <div>
                          <div className="text-gray-600">Agency</div>
                          <div className="font-medium">{formData.agencyName}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan & Suburbs */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Subscription Details</h3>
                    <div className="mb-4">
                      <div className="text-gray-600 text-sm">Plan</div>
                      <div className="font-medium text-lg">
                        {currentTier.name} - ${currentTier.price}/month
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm mb-2">Your Suburbs</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.suburbs.map((suburb) => (
                          <span
                            key={suburb}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {suburb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="border-2 border-primary-600 p-6 rounded-lg bg-primary-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg">Monthly Subscription</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${currentTier.price}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      14-day free trial • Cancel anytime
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>
                        Your card won't be charged for 14 days. Cancel before then and pay nothing.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn bg-gray-100 hover:bg-gray-200 text-gray-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn bg-primary-600 hover:bg-primary-700 text-white px-12"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
