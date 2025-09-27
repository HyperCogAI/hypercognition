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
        <header className="text-center space-y-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Social Trading
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Connect with <span className="text-primary font-medium">top traders</span>, copy successful strategies, and share your trading insights with the <span className="text-accent font-medium">community</span>
          </p>
          
          {/* Stats preview */}
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.5K+</div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
            </div>
            <div className="w-px h-8 bg-border/50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="w-px h-8 bg-border/50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-glow">$50M+</div>
              <div className="text-sm text-muted-foreground">Volume Traded</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          {/* Background patterns */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-12">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 bg-background/90 backdrop-blur-xl border border-border/50 p-2 h-auto rounded-2xl shadow-2xl shadow-primary/5">
                <TabsTrigger 
                  value="feed" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Social Feed</span>
                  <span className="sm:hidden font-medium">Feed</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="network" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">Network</span>
                  <span className="sm:hidden">Net</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="engine" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy Engine</span>
                  <span className="sm:hidden">Copy</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="traders" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Top Traders</span>
                  <span className="sm:hidden">Traders</span>
                  <Badge variant="secondary" className="ml-2 h-6 min-w-6 text-xs px-2 bg-background/80 border-border/50 font-semibold">
                    {topTraders.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="signals" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Trading Signals</span>
                  <span className="sm:hidden">Signals</span>
                  <Badge variant="secondary" className="ml-2 h-6 min-w-6 text-xs px-2 bg-background/80 border-border/50 font-semibold">
                    {tradingSignals.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="competitions" 
                  className="flex items-center gap-2 px-5 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 hover:bg-muted/70 rounded-xl font-medium"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Competitions</span>
                  <span className="sm:hidden">Comp</span>
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

            <TabsContent value="traders" className="space-y-10 animate-fade-in">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Top Performing Traders
                    </h2>
                    <p className="text-muted-foreground">Follow and copy the best in the business</p>
                  </div>
                </div>
                <Badge variant="secondary" className="px-4 py-2 text-base font-bold bg-gradient-to-r from-background/90 to-muted/30 border border-border/50 shadow-lg">
                  {topTraders.length} Active Traders
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
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Latest Trading Signals
                  </h2>
                </div>
                <p className="text-muted-foreground">Real-time insights from market experts</p>
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-background/90 border border-border/50">
                  {tradingSignals.length} Live Signals
                </Badge>
              </div>
              
              {loadingSignals ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-80 bg-muted/30 animate-pulse rounded-xl border border-border/30" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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