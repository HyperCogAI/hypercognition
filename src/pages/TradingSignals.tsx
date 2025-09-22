import React from 'react';
import { TradingSignalsPanel } from '@/components/trading/TradingSignalsPanel';
import { SEOHead } from '@/components/seo/SEOHead';

const TradingSignals = () => {
  return (
    <>
      <SEOHead
        title="Trading Signals - AI Agent Trading Platform"
        description="Real-time trading signals, price alerts, and market insights from professional traders and AI analysis. Get notified of profitable trading opportunities."
        keywords="trading signals, price alerts, buy sell signals, market analysis, trading notifications, crypto signals"
      />
      
      <div className="container mx-auto px-4 py-8">
        <TradingSignalsPanel />
      </div>
    </>
  );
};

export default TradingSignals;