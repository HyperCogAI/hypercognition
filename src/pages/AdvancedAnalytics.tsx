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
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <AdvancedAnalyticsDashboard />
      </div>
    </>
  );
};

export default AdvancedAnalytics;