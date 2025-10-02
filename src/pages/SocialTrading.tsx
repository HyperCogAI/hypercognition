import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, TrendingUp, Trophy, MessageCircle, Network, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Social Trading Platform | Copy Top Traders & Share Signals"
        description="Join our social trading community. Follow successful traders, copy their strategies, share trading signals, and compete in trading competitions."
        keywords="social trading, copy trading, trading signals, trading community, follow traders"
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Social Trading
          </h1>
          <p className="text-muted-foreground">
            Connect with top traders, copy successful strategies, and share insights
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full overflow-x-auto flex lg:grid lg:grid-cols-6 gap-1 scrollbar-hide">
            <TabsTrigger value="feed" className="flex-shrink-0 gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex-shrink-0 gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
            <TabsTrigger value="engine" className="flex-shrink-0 gap-2">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Engine</span>
            </TabsTrigger>
            <TabsTrigger value="traders" className="flex-shrink-0 gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Top Traders</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex-shrink-0 gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Signals</span>
            </TabsTrigger>
            <TabsTrigger value="competitions" className="flex-shrink-0 gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Competitions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <SocialNetwork />
          </TabsContent>

          <TabsContent value="engine" className="mt-6">
            <CopyTradingEngine />
          </TabsContent>

          <TabsContent value="traders" className="mt-6 space-y-6">
            {loadingTraders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
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

          <TabsContent value="signals" className="mt-6 space-y-6">
            {loadingSignals ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tradingSignals.map((signal) => (
                  <TradingSignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <CompetitionsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}