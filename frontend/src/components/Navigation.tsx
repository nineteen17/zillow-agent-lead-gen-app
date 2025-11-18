'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, Search, Calculator, Users } from 'lucide-react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Zillow NZ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link href="/estimate" className="text-gray-700 hover:text-primary-600 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Get Estimate
            </Link>
            <Link href="/agents" className="text-gray-700 hover:text-primary-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              For Agents
            </Link>
            <Link href="/dashboard/agent" className="btn btn-primary">
              Agent Dashboard
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Search Properties
            </Link>
            <Link
              href="/estimate"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Get Estimate
            </Link>
            <Link
              href="/agents"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              For Agents
            </Link>
            <Link
              href="/dashboard/agent"
              className="block px-3 py-2 bg-primary-600 text-white rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Agent Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
