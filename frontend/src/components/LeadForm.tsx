'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateLeadInput } from '@/types';

interface LeadFormProps {
  propertyId?: string;
  suburb: string;
  onSuccess?: () => void;
}

export function LeadForm({ propertyId, suburb, onSuccess }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    leadType: 'buyer' as const,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateLeadInput) => apiClient.createLead(data),
    onSuccess: () => {
      setFormData({ name: '', email: '', phone: '', message: '', leadType: 'buyer' });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      suburb,
      propertyId,
      source: 'web',
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Contact an Agent</h3>

      {mutation.isSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Thank you! An agent will contact you soon.
        </div>
      )}

      {mutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Failed to submit. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I&apos;m interested in
          </label>
          <select
            className="input"
            value={formData.leadType}
            onChange={(e) => setFormData({ ...formData, leadType: e.target.value as any })}
            required
          >
            <option value="buyer">Buying</option>
            <option value="seller">Selling</option>
            <option value="rental">Renting</option>
            <option value="mortgage">Mortgage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            className="input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            className="input"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your requirements..."
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Sending...' : 'Contact Agent'}
        </button>
      </form>
    </div>
  );
}
