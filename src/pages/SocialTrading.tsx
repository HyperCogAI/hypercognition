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
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Social Trading Platform
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with top traders, copy successful strategies, and share your trading insights with the community
          </p>
        </header>

        {/* Main Content */}
        <main>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-8">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 bg-background/80 backdrop-blur-md border border-border/50 p-1.5 h-auto rounded-xl shadow-lg">
                <TabsTrigger 
                  value="feed" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Social Feed</span>
                  <span className="sm:hidden font-medium">Feed</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="network" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Network</span>
                  <span className="sm:hidden font-medium">Net</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="engine" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Copy Engine</span>
                  <span className="sm:hidden font-medium">Copy</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="traders" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Top Traders</span>
                  <span className="sm:hidden font-medium">Traders</span>
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs px-2 bg-background/50">
                    {topTraders.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="signals" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Trading Signals</span>
                  <span className="sm:hidden font-medium">Signals</span>
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs px-2 bg-background/50">
                    {tradingSignals.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="competitions" 
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 hover:bg-muted/70 rounded-lg"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Competitions</span>
                  <span className="sm:hidden font-medium">Comp</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="feed" className="space-y-8 animate-fade-in">
              <SocialFeed />
            </TabsContent>

            <TabsContent value="network" className="space-y-8 animate-fade-in">
              <SocialNetwork />
            </TabsContent>

            <TabsContent value="engine" className="space-y-8 animate-fade-in">
              <CopyTradingEngine />
            </TabsContent>

            <TabsContent value="traders" className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Top Performing Traders</h2>
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-background/50 border border-border/50">
                  {topTraders.length}
                </Badge>
              </div>
              
              {loadingTraders ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-xl border border-border/50" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {topTraders.map((trader) => (
                    <div key={trader.id} className="hover-scale">
                      <TraderCard trader={trader} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="signals" className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Latest Trading Signals</h2>
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-background/50 border border-border/50">
                  {tradingSignals.length}
                </Badge>
              </div>
              
              {loadingSignals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-xl border border-border/50" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tradingSignals.map((signal) => (
                    <div key={signal.id} className="hover-scale">
                      <TradingSignalCard signal={signal} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="competitions" className="space-y-8 animate-fade-in">
              <CompetitionsManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}