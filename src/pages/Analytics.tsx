import React from 'react';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
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
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive market analysis, trading signals, and performance insights
          </p>
        </div>
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <AdvancedAnalyticsDashboard />
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