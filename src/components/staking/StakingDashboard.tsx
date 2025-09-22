import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Gift, TrendingUp } from 'lucide-react';
import { useStaking } from '@/hooks/useStaking';

export const StakingDashboard = () => {
  const { programs, userStakes, loading, stakeTokens, unstakeTokens, claimRewards, calculateRewards } = useStaking();
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, string>>({});

  const handleStake = async (programId: string) => {
    const amount = parseFloat(stakeAmounts[programId] || '0');
    if (amount > 0) {
      await stakeTokens(programId, amount);
      setStakeAmounts(prev => ({ ...prev, [programId]: '' }));
    }
  };

  const isUnlocked = (stake: any): boolean => {
    if (!stake.unlock_at) return true;
    return new Date(stake.unlock_at) <= new Date();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading staking data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lock className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Staking Dashboard</h1>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Staking Programs</TabsTrigger>
          <TabsTrigger value="my-stakes">My Stakes</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {program.name}
                    </CardTitle>
                    <Badge variant="outline">{program.token_symbol}</Badge>
                  </div>
                  <CardDescription>
                    {program.lock_period_days === 0 ? 'Flexible' : `${program.lock_period_days} days lock`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">APY</span>
                      <div className="text-lg font-semibold text-green-600">
                        {program.apy.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Staked</span>
                      <div className="text-lg font-semibold">
                        {program.total_staked.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Stake</span>
                      <div className="text-sm font-medium">
                        {program.min_stake_amount.toLocaleString()} {program.token_symbol}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rewards Pool</span>
                      <div className="text-sm font-medium">
                        {program.rewards_pool.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`Min ${program.min_stake_amount} ${program.token_symbol}`}
                      value={stakeAmounts[program.id] || ''}
                      onChange={(e) => setStakeAmounts(prev => ({
                        ...prev,
                        [program.id]: e.target.value
                      }))}
                    />
                    <Button 
                      onClick={() => handleStake(program.id)}
                      className="w-full"
                      disabled={
                        !stakeAmounts[program.id] || 
                        parseFloat(stakeAmounts[program.id]) < program.min_stake_amount
                      }
                    >
                      Stake Tokens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-stakes" className="space-y-4">
          {userStakes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Stakes</h3>
                <p className="text-muted-foreground text-center">
                  Start staking tokens to earn rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {userStakes.map((stake) => {
                const estimatedRewards = calculateRewards(stake);
                const unlocked = isUnlocked(stake);
                
                return (
                  <Card key={stake.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {unlocked ? (
                            <Unlock className="h-5 w-5 text-green-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-orange-500" />
                          )}
                          {stake.program?.name}
                        </CardTitle>
                        <Badge variant={unlocked ? "default" : "secondary"}>
                          {unlocked ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Staked: {stake.amount.toLocaleString()} {stake.program?.token_symbol}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Rewards</span>
                          <div className="text-lg font-semibold text-green-600">
                            {estimatedRewards.toFixed(4)} {stake.program?.token_symbol}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">APY</span>
                          <div className="text-lg font-semibold">
                            {stake.program?.apy.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {stake.unlock_at && !unlocked && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Unlock Progress</span>
                            <span>{new Date(stake.unlock_at).toLocaleDateString()}</span>
                          </div>
                          <Progress 
                            value={
                              (Date.now() - new Date(stake.staked_at).getTime()) / 
                              (new Date(stake.unlock_at).getTime() - new Date(stake.staked_at).getTime()) * 100
                            } 
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => claimRewards(stake.id)}
                          disabled={estimatedRewards <= 0}
                          className="flex-1"
                          variant="outline"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Rewards
                        </Button>
                        <Button 
                          onClick={() => unstakeTokens(stake.id)}
                          disabled={!unlocked}
                          variant="destructive"
                          className="flex-1"
                        >
                          Unstake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};