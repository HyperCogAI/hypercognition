import React from 'react';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { SolanaAnalyticsDashboard } from '@/components/analytics/SolanaAnalyticsDashboard';
import { MarketNewsComponent } from '@/components/news/MarketNewsComponent';
import { TradingSignalsPanel } from '@/components/trading/TradingSignalsPanel';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  return (
    <>
      <SEOHead
        title="Analytics Dashboard - AI Agent Trading Insights"
        description="Advanced analytics dashboard with market insights, trading signals, news sentiment analysis, and comprehensive portfolio performance metrics."
        keywords="trading analytics, market insights, portfolio analysis, trading signals, market news, sentiment analysis"
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Analytics Dashboard
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive <span className="text-primary font-medium">market analysis</span>, trading signals, and performance insights
          </p>
        </header>
        
        <Tabs defaultValue="agents" className="space-y-8">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-2 h-auto rounded-xl">
              <TabsTrigger 
                value="agents" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
              >
                <span className="hidden sm:inline">AI Agents</span>
                <span className="sm:hidden">Agents</span>
              </TabsTrigger>
              <TabsTrigger 
                value="solana" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
              >
                Solana
              </TabsTrigger>
              <TabsTrigger 
                value="signals" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
              >
                <span className="hidden sm:inline">Trading Signals</span>
                <span className="sm:hidden">Signals</span>
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium"
              >
                <span className="hidden sm:inline">Market News</span>
                <span className="sm:hidden">News</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="agents" className="animate-fade-in">
            <AdvancedAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="solana" className="animate-fade-in">
            <SolanaAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="signals" className="animate-fade-in">
            <TradingSignalsPanel />
          </TabsContent>
          
          <TabsContent value="news" className="animate-fade-in">
            <MarketNewsComponent />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Analytics;