'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Calculator, TrendingUp } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';

export default function EstimatePage() {
  const [address, setAddress] = useState('');
  const [valuation, setValuation] = useState<any>(null);

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
          <div className="space-y-4">
            <input
              type="text"
              className="input"
              placeholder="Enter property address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button className="btn btn-primary w-full">
              Get Free Estimate
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            * Estimates are based on publicly available data and may not reflect current market conditions.
          </p>
        </div>

        {valuation && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-start gap-4">
                <TrendingUp className="h-12 w-12 text-primary-600" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Estimated Value</h3>
                  <p className="text-4xl font-bold text-primary-600">
                    {new Intl.NumberFormat('en-NZ', {
                      style: 'currency',
                      currency: 'NZD',
                      minimumFractionDigits: 0,
                    }).format(valuation.estimateValue)}
                  </p>
                </div>
              </div>
            </div>

            <LeadForm suburb="Auckland Central" />
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
