import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Coins, Droplets, Zap } from 'lucide-react';
import { RealDeFiService } from '../../services/RealDeFiService';
import { useState } from 'react';

export const DeFiDashboard = () => {
  const [pools, setPools] = React.useState<any[]>([]);
  const [userPositions, setUserPositions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [depositAmounts, setDepositAmounts] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    loadDeFiData();
  }, []);

  const loadDeFiData = async () => {
    try {
      setLoading(true);
      const [poolsData, positionsData] = await Promise.all([
        RealDeFiService.getDeFiPools(),
        RealDeFiService.getUserDeFiPositions('current_user') // Will need auth context
      ]);
      setPools(poolsData);
      setUserPositions(positionsData);
    } catch (error) {
      console.error('Error loading DeFi data:', error);
    } finally {
      setLoading(false);
    }
  };

  const depositToPool = async (poolId: string, amount: number) => {
    try {
      await RealDeFiService.depositToPool('current_user', poolId, amount);
      await loadDeFiData(); // Refresh data
    } catch (error) {
      console.error('Error depositing to pool:', error);
    }
  };

  const claimRewards = async (positionId: string) => {
    try {
      await RealDeFiService.claimRewards('current_user', positionId);
      await loadDeFiData(); // Refresh data
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const handleDeposit = async (poolId: string) => {
    const amount = parseFloat(depositAmounts[poolId] || '0');
    if (amount > 0) {
      await depositToPool(poolId, amount);
      setDepositAmounts(prev => ({ ...prev, [poolId]: '' }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading DeFi data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold text-white leading-tight">
          DeFi{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Available Pools</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => (
              <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {pool.type === 'yield_farming' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <Droplets className="h-5 w-5 text-blue-500" />
                      )}
                      {pool.name}
                    </CardTitle>
                    <Badge variant={pool.type === 'yield_farming' ? 'default' : 'secondary'}>
                      {pool.type === 'yield_farming' ? 'Yield Farming' : 'Liquidity Mining'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {pool.base_token}/{pool.quote_token} • Rewards: {pool.rewards_token}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">APY</span>
                      <div className="text-lg font-semibold text-green-600">
                        {pool.apy.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TVL</span>
                      <div className="text-lg font-semibold">
                        ${pool.tvl.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Amount to deposit"
                      value={depositAmounts[pool.id] || ''}
                      onChange={(e) => setDepositAmounts(prev => ({
                        ...prev,
                        [pool.id]: e.target.value
                      }))}
                    />
                    <Button 
                      onClick={() => handleDeposit(pool.id)}
                      className="w-full"
                      disabled={!depositAmounts[pool.id] || parseFloat(depositAmounts[pool.id]) <= 0}
                    >
                      Deposit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          {userPositions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No DeFi Positions</h3>
                <p className="text-muted-foreground text-center">
                  Start by depositing into a DeFi pool to earn rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {userPositions.map((position) => (
                <Card key={position.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {position.pool?.name}
                      <Badge variant="outline">
                        {position.pool?.type === 'yield_farming' ? 'Farming' : 'Mining'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {position.pool?.base_token}/{position.pool?.quote_token}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deposited</span>
                        <div className="text-lg font-semibold">
                          {position.amount_deposited.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rewards</span>
                        <div className="text-lg font-semibold text-green-600">
                          {position.rewards_earned.toFixed(4)} {position.pool?.rewards_token}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      APY: {position.pool?.apy.toFixed(2)}%
                    </div>
                    <Button 
                      onClick={() => claimRewards(position.id)}
                      disabled={position.rewards_earned <= 0}
                      className="w-full"
                    >
                      Claim Rewards
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};