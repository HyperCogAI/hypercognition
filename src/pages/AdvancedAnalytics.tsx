import React from 'react';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const AdvancedAnalytics = () => {
  return (
    <>
      <SEOHead 
        title="Advanced Analytics - Real-time Market Data & Technical Analysis | HyperCognition"
        description="Advanced trading analytics dashboard with real-time market data, technical indicators, sentiment analysis, and comprehensive market insights for AI agent trading."
        keywords="AI trading analytics, market data, technical analysis, trading indicators, sentiment analysis, portfolio analytics"
      />
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Advanced Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time market data, technical analysis, and comprehensive insights for AI agent trading
          </p>
        </div>
        <AdvancedAnalyticsDashboard />
      </div>
    </>
  );
};

export default AdvancedAnalytics;