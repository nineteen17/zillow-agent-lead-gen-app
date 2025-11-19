'use client';

import { useState } from 'react';
import { Check, TrendingUp, Users, Target, DollarSign, Clock, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForAgentsPage() {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'seller'>('premium');

  const pricingTiers = {
    basic: {
      name: 'Basic',
      price: 199,
      leads: 5,
      features: [
        '5 buyer leads per month',
        'Suburb exclusivity',
        'Lead notifications via email',
        'Basic analytics dashboard',
        'Profile page with photo & bio',
      ],
      popular: false,
    },
    premium: {
      name: 'Premium',
      price: 399,
      leads: 15,
      features: [
        '15 buyer leads per month',
        'Priority lead routing',
        'SMS + Email notifications',
        'Advanced analytics & insights',
        'Featured agent badge',
        'Priority customer support',
      ],
      popular: true,
    },
    seller: {
      name: 'Seller Plus',
      price: 599,
      leads: 25,
      features: [
        '25 total leads per month',
        'Buyer + Seller leads',
        'Premium lead routing',
        'SMS + Email + Push notifications',
        'Market trend reports',
        'Featured in valuation results',
        'Dedicated account manager',
      ],
      popular: false,
    },
  };

  const stats = [
    { label: 'Monthly Visitors', value: '50,000+', icon: Users },
    { label: 'Property Valuations', value: '10,000+', icon: TrendingUp },
    { label: 'Active Suburbs', value: '2,000+', icon: Target },
    { label: 'Avg Lead Value', value: '$15,000', icon: DollarSign },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Choose Your Suburbs',
      description: 'Select the suburbs where you want to receive leads. Get exclusivity in your chosen areas.',
    },
    {
      step: 2,
      title: 'Get Matched Leads',
      description: 'Receive high-quality buyer and seller leads automatically matched to your suburbs.',
    },
    {
      step: 3,
      title: 'Close More Deals',
      description: 'Connect with motivated buyers and sellers. Track your performance with real-time analytics.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      agency: 'Premium Realty Auckland',
      suburb: 'Albany',
      quote: 'Signed up 2 months ago and already closed 3 deals. Best ROI of any marketing channel.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      agency: 'Wellington Homes',
      suburb: 'Newtown',
      quote: 'The lead quality is incredible. Every lead is genuinely interested in buying or selling.',
      rating: 5,
    },
    {
      name: 'Lisa Patel',
      agency: 'Christchurch Property Group',
      suburb: 'Merivale',
      quote: 'Finally, a platform that actually delivers what it promises. Worth every dollar.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get Exclusive Buyer & Seller Leads
            </h1>
            <p className="text-2xl mb-8 text-primary-100">
              Join New Zealand's fastest-growing property platform for real estate agents
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#pricing"
                className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                View Pricing
              </Link>
              <Link
                href="#how-it-works"
                className="btn bg-primary-700 hover:bg-primary-600 text-lg px-8 py-4"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Start getting leads in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(pricingTiers).map(([key, tier]) => (
              <div
                key={key}
                className={`card relative ${
                  tier.popular ? 'ring-2 ring-primary-600 shadow-2xl' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 mt-2">Up to {tier.leads} leads/month</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/agent/signup?tier=${key}`}
                  className={`btn w-full ${
                    tier.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include a <strong>14-day free trial</strong>. No credit card required.
              Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Top Agents</h2>
            <p className="text-xl text-gray-600">See what our agents are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.agency}</div>
                  <div className="text-sm text-primary-600">{testimonial.suburb}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-2">How are leads generated?</h3>
              <p className="text-gray-700">
                Leads come from users requesting property valuations, contacting agents about
                properties, and submitting buyer/seller inquiries through our platform. All leads
                are verified and matched to your chosen suburbs.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-2">What is suburb exclusivity?</h3>
              <p className="text-gray-700">
                You'll be the only agent in your tier receiving leads for your chosen suburbs. We
                limit the number of agents per suburb to ensure high lead quality and exclusivity.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-2">How quickly will I get leads?</h3>
              <p className="text-gray-700">
                Most agents receive their first lead within 48 hours of signing up. Lead volume
                depends on your chosen suburbs and market activity.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700">
                Yes! You can cancel your subscription at any time. There are no long-term contracts
                or cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join hundreds of agents already getting exclusive leads in their suburbs
          </p>
          <Link
            href="/agent/signup"
            className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-12 py-4 inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-primary-200">14-day free trial • No credit card required</p>
        </div>
      </div>
    </div>
  );
}
