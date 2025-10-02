import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, Coins, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RealStakingService } from '@/services/RealStakingService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const StakingDashboard = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [userStakes, setUserStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadStakingData();
  }, []);

  const loadStakingData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view staking data",
          variant: "destructive",
        });
        return;
      }

      const [programsData, stakesData] = await Promise.all([
        RealStakingService.getStakingPrograms(),
        RealStakingService.getUserStakes(user.id)
      ]);
      
      setPrograms(programsData);
      setUserStakes(stakesData);
    } catch (error) {
      console.error('Error loading staking data:', error);
      toast({
        title: "Error",
        description: "Failed to load staking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async (programId: string) => {
    const amount = parseFloat(stakeAmounts[programId] || '0');
    if (amount <= 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to stake",
          variant: "destructive",
        });
        return;
      }

      await RealStakingService.stakeTokens(user.id, programId, amount);
      toast({
        title: "Success",
        description: "Tokens staked successfully",
      });
      setStakeAmounts(prev => ({ ...prev, [programId]: '' }));
      await loadStakingData();
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast({
        title: "Error",
        description: "Failed to stake tokens",
        variant: "destructive",
      });
    }
  };

  const handleUnstake = async (stakeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await RealStakingService.unstakeTokens(user.id, stakeId);
      toast({
        title: "Success",
        description: "Tokens unstaked successfully",
      });
      await loadStakingData();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast({
        title: "Error",
        description: "Failed to unstake tokens",
        variant: "destructive",
      });
    }
  };

  const handleClaimRewards = async (stakeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await RealStakingService.claimRewards(user.id, stakeId);
      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      });
      await loadStakingData();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Error",
        description: "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading staking data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Staking Programs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Staking Programs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    {program.token_symbol}
                  </CardTitle>
                  <Badge>{program.lock_period_days} days</Badge>
                </div>
                <CardDescription>{program.token_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">APY</span>
                    <div className="text-xl font-bold text-green-600">
                      {program.apy.toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Min Stake</span>
                    <div className="text-xl font-bold">
                      {program.min_stake}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <Input
                    type="number"
                    placeholder="Amount to stake"
                    value={stakeAmounts[program.id] || ''}
                    onChange={(e) => setStakeAmounts(prev => ({
                      ...prev,
                      [program.id]: e.target.value
                    }))}
                  />
                  <Button 
                    onClick={() => handleStake(program.id)}
                    className="w-full"
                    disabled={!stakeAmounts[program.id] || parseFloat(stakeAmounts[program.id]) < program.min_stake}
                  >
                    Stake Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Stakes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Stakes</h2>
        {userStakes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Stakes</h3>
              <p className="text-muted-foreground text-center">
                Start staking to earn passive rewards on your tokens
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {userStakes.map((stake) => {
              const rewards = RealStakingService.calculateRewards(stake);
              return (
                <Card key={stake.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {stake.staking_program?.token_symbol}
                      </CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <CardDescription>
                      Staked {stake.amount_staked} tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Rewards Earned</span>
                        <div className="text-lg font-bold text-green-600">
                          {rewards.toFixed(4)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">APY</span>
                        <div className="text-lg font-bold">
                          {stake.staking_program?.apy.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        onClick={() => handleClaimRewards(stake.id)}
                        disabled={rewards <= 0}
                        className="flex-1"
                        variant="default"
                      >
                        Claim
                      </Button>
                      <Button 
                        onClick={() => handleUnstake(stake.id)}
                        className="flex-1"
                        variant="outline"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unstake
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
