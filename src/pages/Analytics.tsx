import React, { useState, useEffect } from 'react';
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
        description="Advanced real-time analytics for Solana, Ethereum, Base, and BNB Chain. Enterprise-grade chain metrics, cross-chain analysis, and live market data."
        keywords="web3 analytics, solana analytics, ethereum analytics, bnb chain analytics, real-time blockchain data, defi analytics, cross-chain metrics"
      />
      
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time analytics with live chain metrics, cross-chain analysis, and market insights
          </p>
        </header>

        {/* Fear & Greed Index Widget - Prominent Display */}
        {marketSentiment && (
          <FearGreedWidget
            fearGreedIndex={marketSentiment.fearGreedIndex}
            bullishPercentage={marketSentiment.bullishPercentage}
            bearishPercentage={marketSentiment.bearishPercentage}
            neutralPercentage={marketSentiment.neutralPercentage}
            socialSentiment={marketSentiment.socialSentiment}
          />
        )}
        
        <Tabs defaultValue="chains" className="space-y-6 sm:space-y-8">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-1.5 sm:p-2 h-auto rounded-xl shadow-lg">
              <TabsTrigger 
                value="chains" 
                className="px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Chain Analytics</span>
                <span className="sm:hidden">Chains</span>
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Agents</span>
                <span className="sm:hidden">Agents</span>
              </TabsTrigger>
              <TabsTrigger 
                value="influence" 
                className="px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Social Influence</span>
                <span className="sm:hidden">Social</span>
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/70 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Market News</span>
                <span className="sm:hidden">News</span>
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