'use client';

/**
 * Main Page Component
 * Entry point for the Saros DLMM Portfolio Dashboard
 */

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of PortfolioDashboard with SSR disabled
const PortfolioDashboard = dynamic(
  () => import('@/components/PortfolioDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Portfolio Dashboard...</p>
        </div>
      </div>
    )
  }
);

/**
 * Home Component
 * Renders the main portfolio dashboard
 */
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing Dashboard...</p>
        </div>
      </div>
    }>
      <PortfolioDashboard />
    </Suspense>
  );
}
