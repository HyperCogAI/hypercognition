import React from 'react';
import { TechnicalAnalysisDashboard } from '@/components/analytics/TechnicalAnalysisDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const TechnicalAnalysis: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Technical Analysis & Charting | HyperCognition"
        description="Professional charting tools with technical indicators, pattern recognition, and market screening for advanced trading analysis."
        keywords="technical analysis, trading charts, indicators, pattern recognition, market screener, candlestick charts"
      />
      
      <div className="container mx-auto p-6">
        <TechnicalAnalysisDashboard />
      </div>
    </>
  );
};

export default TechnicalAnalysis;