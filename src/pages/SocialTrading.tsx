import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, TrendingUp, Trophy, MessageCircle, Network, Copy } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useSocialTrading } from '@/hooks/useSocialTrading';
import { TraderCard } from '@/components/social/TraderCard';
import { TradingSignalCard } from '@/components/social/TradingSignalCard';
import { CopyTradingEngine } from '@/components/social/CopyTradingEngine';
import { CompetitionsManager } from '@/components/competitions/CompetitionsManager';
import { SocialFeed } from '@/components/social/SocialFeed';
import { SocialNetwork } from '@/components/social/SocialNetwork';

export default function SocialTrading() {
  const [activeTab, setActiveTab] = useState("feed");
  const {
    topTraders,
    tradingSignals,
    competitions,
    loadingTraders,
    loadingSignals,
    loadingCompetitions
  } = useSocialTrading();

  return (
    <>
      <SEOHead 
        title="Social Trading Platform | Copy Top Traders & Share Signals"
        description="Join our social trading community. Follow successful traders, copy their strategies, share trading signals, and compete in trading competitions."
        keywords="social trading, copy trading, trading signals, trading community, follow traders"
      />
      
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Share2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">
              Social Trading Platform
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with top traders, copy successful strategies, and share your trading insights with the community
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 bg-background/50 backdrop-blur-sm border border-border/50 p-1 h-auto">
              <TabsTrigger 
                value="feed" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Social Feed</span>
                <span className="sm:hidden">Feed</span>
              </TabsTrigger>
              <TabsTrigger 
                value="network" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">Network</span>
                <span className="sm:hidden">Net</span>
              </TabsTrigger>
              <TabsTrigger 
                value="engine" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Engine</span>
                <span className="sm:hidden">Copy</span>
              </TabsTrigger>
              <TabsTrigger 
                value="traders" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Top Traders</span>
                <span className="sm:hidden">Traders</span>
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs px-1.5">
                  {topTraders.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="signals" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trading Signals</span>
                <span className="sm:hidden">Signals</span>
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs px-1.5">
                  {tradingSignals.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="competitions" 
                className="flex items-center gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Competitions</span>
                <span className="sm:hidden">Comp</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="space-y-6">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <SocialNetwork />
          </TabsContent>

          <TabsContent value="engine" className="space-y-6">
            <CopyTradingEngine />
          </TabsContent>

          <TabsContent value="traders" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Top Performing Traders</h2>
              <Badge variant="secondary">{topTraders.length}</Badge>
            </div>
            
            {loadingTraders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topTraders.map((trader) => (
                  <TraderCard key={trader.id} trader={trader} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Latest Trading Signals</h2>
              <Badge variant="secondary">{tradingSignals.length}</Badge>
            </div>
            
            {loadingSignals ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tradingSignals.map((signal) => (
                  <TradingSignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="competitions" className="space-y-6">
            <CompetitionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}