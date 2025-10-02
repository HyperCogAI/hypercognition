import React from 'react';
import { EnterpriseChainAnalytics } from '@/components/analytics/EnterpriseChainAnalytics';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { MarketNewsComponent } from '@/components/news/MarketNewsComponent';
import { KaitoInfluenceDashboard } from '@/components/analytics/KaitoInfluenceDashboard';
import { KaitoTestPanel } from '@/components/analytics/KaitoTestPanel';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Layers, TrendingUp, Newspaper, Sparkles } from 'lucide-react';

const Analytics = () => {
  return (
    <>
      <SEOHead
        title="Enterprise Analytics - Real-Time Web3 Insights"
        description="Advanced real-time analytics for Solana, Ethereum, Base, and Polygon. Enterprise-grade chain metrics, cross-chain analysis, and live market data."
        keywords="web3 analytics, solana analytics, ethereum analytics, real-time blockchain data, defi analytics, cross-chain metrics"
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 border border-primary/30">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Enterprise Analytics
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real-time <span className="text-primary font-semibold">Solana & EVM</span> analytics with live chain metrics, 
            cross-chain analysis, and institutional-grade market insights
          </p>
        </header>
        
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
          
          <TabsContent value="chains" className="animate-fade-in">
            <EnterpriseChainAnalytics />
          </TabsContent>
          
          <TabsContent value="agents" className="animate-fade-in">
            <AdvancedAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="influence" className="animate-fade-in">
            <div className="space-y-6">
              <KaitoTestPanel />
              <KaitoInfluenceDashboard />
            </div>
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