import React from 'react';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { SolanaAnalyticsDashboard } from '@/components/analytics/SolanaAnalyticsDashboard';
import { MarketNewsComponent } from '@/components/news/MarketNewsComponent';
import { TradingSignalsPanel } from '@/components/trading/TradingSignalsPanel';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  return (
    <>
      <SEOHead
        title="Analytics Dashboard - AI Agent Trading Insights"
        description="Advanced analytics dashboard with market insights, trading signals, news sentiment analysis, and comprehensive portfolio performance metrics."
        keywords="trading analytics, market insights, portfolio analysis, trading signals, market news, sentiment analysis"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            Analytics{" "}
            <span className="text-white">
              Dashboard
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive market analysis, trading signals, and performance insights
          </p>
        </div>
        
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents">
            <AdvancedAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="solana">
            <SolanaAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="signals">
            <TradingSignalsPanel />
          </TabsContent>
          
          <TabsContent value="news">
            <MarketNewsComponent />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Analytics;