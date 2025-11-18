'use client';

import { Users, TrendingUp, Target, Award } from 'lucide-react';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a Premier Agent
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Connect with motivated buyers and sellers in your area
          </p>
          <Link href="/dashboard/agent" className="btn bg-white text-primary-600 text-lg px-8 py-3">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Zillow NZ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Target className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Qualified Leads</h3>
              <p className="text-gray-600">
                Receive pre-qualified leads actively looking to buy or sell
              </p>
            </div>
            <div className="text-center">
              <Users className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
              <p className="text-gray-600">
                Choose specific suburbs where you want to receive leads
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
              <p className="text-gray-600">
                Track your response time, conversion rate, and more
              </p>
            </div>
            <div className="text-center">
              <Award className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Pricing</h3>
              <p className="text-gray-600">
                Choose a plan that fits your business needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Premier Agent Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 10 leads per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 suburb coverage
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic analytics
                </li>
              </ul>
              <button className="btn btn-outline w-full">Choose Basic</button>
            </div>

            <div className="card hover:shadow-xl transition-shadow border-2 border-primary-600">
              <div className="bg-primary-600 text-white px-4 py-1 rounded-full inline-block mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$249</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 50 leads per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 suburb coverage
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority lead routing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>
              <button className="btn btn-primary w-full">Choose Premium</button>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Seller</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited leads
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 5 suburbs
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Highest priority routing
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Dedicated support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Featured listing placement
                </li>
              </ul>
              <button className="btn btn-outline w-full">Choose Seller</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of successful agents using Zillow NZ Premier Agent
          </p>
          <Link href="/dashboard/agent" className="btn bg-white text-primary-600 text-lg px-8 py-3">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
