import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StakingDashboard } from './StakingDashboard';
import { SolanaStakingPools } from './SolanaStakingPools';
import { SolanaValidators } from './SolanaValidators';
import { SolanaStakePortfolio } from './SolanaStakePortfolio';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { CyberButton } from '@/components/ui/cyber-button';
import { Coins, Lock, TrendingUp, DollarSign } from 'lucide-react';

export const UnifiedStakingDashboard = () => {
  const { isConnected: isSolanaConnected, connectWallet } = useSolanaWallet();
  const [activeTab, setActiveTab] = useState('traditional');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Staking Dashboard</h1>
        <p className="text-muted-foreground">
          Stake your tokens to earn passive rewards across multiple networks
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Across all networks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stakes</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Locked positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. APY</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traditional">Traditional Staking</TabsTrigger>
          <TabsTrigger value="solana">Solana Staking</TabsTrigger>
        </TabsList>

        <TabsContent value="traditional" className="space-y-4">
          <StakingDashboard />
        </TabsContent>

        <TabsContent value="solana" className="space-y-4">
          {!isSolanaConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Solana Wallet</CardTitle>
                <CardDescription>
                  Connect your Solana wallet to access Solana staking features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CyberButton onClick={connectWallet} className="w-full">
                  Connect Solana Wallet
                </CyberButton>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="pools" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pools">Staking Pools</TabsTrigger>
                <TabsTrigger value="validators">Validators</TabsTrigger>
                <TabsTrigger value="portfolio">My Stakes</TabsTrigger>
              </TabsList>

              <TabsContent value="pools" className="space-y-4">
                <SolanaStakingPools />
              </TabsContent>

              <TabsContent value="validators" className="space-y-4">
                <SolanaValidators />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4">
                <SolanaStakePortfolio />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
