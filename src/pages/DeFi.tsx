import { SEOHead } from '@/components/seo/SEOHead';
import { DeFiPoolCard } from '@/components/defi/DeFiPoolCard';
import { UserPositionCard } from '@/components/defi/UserPositionCard';
import { DeFiStatsOverview } from '@/components/defi/DeFiStatsOverview';
import { StakingDashboard } from '@/components/defi/StakingDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchInput } from '@/components/ui/search-input';
import { ArrowLeft, Coins, Lock, TrendingUp, Zap, Repeat, LineChart } from 'lucide-react';
import { LimitOrderPanel } from '@/components/defi/LimitOrderPanel';
import { EVMDEX } from '@/components/evm/EVMDEX';
import { EVMSwapHistory } from '@/components/evm/EVMSwapHistory';
import { useEVMSwap } from '@/hooks/useEVMSwap';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { RealDeFiService } from '@/services/RealDeFiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const DeFi = () => {
  const [pools, setPools] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { swapHistory } = useEVMSwap();

  useEffect(() => {
    loadDeFiData();
  }, []);

  const loadDeFiData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const poolsData = await RealDeFiService.getDeFiPools();
      setPools(poolsData);

      if (user) {
        const positionsData = await RealDeFiService.getUserDeFiPositions(user.id);
        setUserPositions(positionsData);
      }
    } catch (error) {
      console.error('Error loading DeFi data:', error);
      toast({
        title: "Error",
        description: "Failed to load DeFi data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (poolId: string, amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to deposit",
          variant: "destructive",
        });
        return;
      }

      await RealDeFiService.depositToPool(user.id, poolId, amount);
      toast({
        title: "Success",
        description: "Deposit successful",
      });
      await loadDeFiData();
    } catch (error) {
      console.error('Error depositing:', error);
      toast({
        title: "Error",
        description: "Failed to deposit",
        variant: "destructive",
      });
    }
  };

  const handleClaimRewards = async (positionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await RealDeFiService.claimRewards(user.id, positionId);
      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      });
      await loadDeFiData();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Error",
        description: "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  const filteredPools = useMemo(() => {
    if (!searchQuery) return pools;
    const query = searchQuery.toLowerCase();
    return pools.filter(pool => 
      pool.name.toLowerCase().includes(query) ||
      pool.base_token.toLowerCase().includes(query) ||
      pool.quote_token.toLowerCase().includes(query)
    );
  }, [pools, searchQuery]);

  const stats = {
    totalTVL: pools.reduce((sum, pool) => sum + pool.tvl, 0),
    totalPools: pools.length,
    userPositions: userPositions.length,
    totalRewards: userPositions.reduce((sum, pos) => sum + pos.rewards_earned, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading DeFi data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="DeFi Dashboard - Yield Farming & Liquidity Mining | HyperCognition"
        description="Access decentralized finance opportunities with yield farming and liquidity mining. Earn rewards by providing liquidity to AI agent trading pools."
        keywords="DeFi, yield farming, liquidity mining, cryptocurrency rewards, decentralized finance"
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              DeFi Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Earn passive income through yield farming and liquidity mining
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <DeFiStatsOverview {...stats} />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dex" className="w-full">
          <TabsList className="w-full !grid grid-cols-3 lg:!flex lg:flex-nowrap !h-auto lg:h-10 gap-1 lg:gap-2 p-0.5 lg:p-1">
            <TabsTrigger value="dex" className="w-full gap-1.5 text-xs lg:text-sm">
              <Repeat className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>DEX</span>
            </TabsTrigger>
            <TabsTrigger value="limit" className="w-full gap-1.5 text-xs lg:text-sm">
              <LineChart className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Limit Orders</span>
            </TabsTrigger>
            <TabsTrigger value="pools" className="w-full gap-1.5 text-xs lg:text-sm">
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Pools</span>
            </TabsTrigger>
            <TabsTrigger value="positions" className="w-full gap-1.5 text-xs lg:text-sm">
              <Coins className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Positions</span>
            </TabsTrigger>
            <TabsTrigger value="staking" className="w-full gap-1.5 text-xs lg:text-sm">
              <Lock className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Staking</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dex" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <EVMDEX />
              <EVMSwapHistory swaps={swapHistory} />
            </div>
          </TabsContent>

          <TabsContent value="limit" className="mt-6">
            <LimitOrderPanel pools={pools} />
          </TabsContent>

          <TabsContent value="pools" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPools.map((pool) => (
                <DeFiPoolCard
                  key={pool.id}
                  pool={pool}
                  onDeposit={handleDeposit}
                />
              ))}
            </div>
            {filteredPools.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No pools found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="positions" className="mt-6">
            {userPositions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Positions</h3>
                  <p className="text-muted-foreground text-center">
                    Start by depositing into a liquidity pool to earn rewards
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {userPositions.map((position) => (
                  <UserPositionCard
                    key={position.id}
                    position={position}
                    onClaimRewards={handleClaimRewards}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="staking" className="mt-6">
            <StakingDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeFi;