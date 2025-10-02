import React from 'react';
import { EnterpriseChainAnalytics } from '@/components/analytics/EnterpriseChainAnalytics';
import { SolanaAnalyticsDashboard } from '@/components/analytics/SolanaAnalyticsDashboard';
import { MarketNewsComponent } from '@/components/news/MarketNewsComponent';
import { KaitoInfluenceDashboard } from '@/components/analytics/KaitoInfluenceDashboard';
import { FearGreedWidget } from '@/components/analytics/FearGreedWidget';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Layers, TrendingUp, Newspaper, Sparkles } from 'lucide-react';
import { useMarketNewsData } from '@/hooks/useMarketNewsData';

const Analytics = () => {
  const { marketSentiment } = useMarketNewsData();

  return (
    <>
      <SEOHead
        title="Analytics - Real-Time Web3 Insights"
        description="Advanced real-time analytics for Solana, Ethereum, Base, and Polygon. Enterprise-grade chain metrics, cross-chain analysis, and live market data."
        keywords="web3 analytics, solana analytics, ethereum analytics, real-time blockchain data, defi analytics, cross-chain metrics"
      />
      
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Real-time Solana & EVM analytics with live chain metrics, cross-chain analysis, and market insights
          </p>
        </header>

        {/* Fear & Greed Index Widget - Prominent Display */}
        {marketSentiment && (
          <FearGreedWidget
            fearGreedIndex={marketSentiment.fearGreedIndex}
            overallSentiment={marketSentiment.overallSentiment}
            bullishPercentage={marketSentiment.bullishPercentage}
            bearishPercentage={marketSentiment.bearishPercentage}
            neutralPercentage={marketSentiment.neutralPercentage}
            socialSentiment={marketSentiment.socialSentiment}
          />
        )}
        
        <Tabs defaultValue="chains" className="space-y-8">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-2 h-auto rounded-xl shadow-lg">
              <TabsTrigger 
                value="chains" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                <span>Chain Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>AI Agents</span>
              </TabsTrigger>
              <TabsTrigger 
                value="influence" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Social Influence</span>
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-2"
              >
                <Newspaper className="h-4 w-4" />
                <span>Market News</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chains" className="animate-fade-in space-y-6">
            <EnterpriseChainAnalytics />
          </TabsContent>
          
          <TabsContent value="agents" className="animate-fade-in">
            <SolanaAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="influence" className="animate-fade-in">
            <div className="space-y-6">
              <KaitoInfluenceDashboard />
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="animate-fade-in">
            <MarketNewsComponent />
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </>
  );
};

export default Analytics;