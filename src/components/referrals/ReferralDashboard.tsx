import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Copy, TrendingUp, Users, DollarSign, Award, CheckCircle, Clock } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

export const ReferralDashboard = () => {
  const {
    userReferral,
    conversions,
    rewards,
    leaderboard,
    loading,
    applyReferralCode,
    claimReward,
    refetch
  } = useReferrals();
  const { toast } = useToast();
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  const copyReferralLink = () => {
    if (!userReferral) return;
    
    const referralLink = `${window.location.origin}/signup?ref=${userReferral.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleApplyCode = async () => {
    if (!referralCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    await applyReferralCode(referralCodeInput.trim());
    setApplying(false);
    setReferralCodeInput('');
  };

  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const paidRewards = rewards.filter(r => r.status === 'paid');
  const totalPending = pendingRewards.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = paidRewards.reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading referral data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-white">
          Referral Program
        </h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards for every successful referral
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(userReferral?.total_earnings || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime referral earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{pendingRewards.length} unclaimed rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userReferral?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">Friends referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              #{leaderboard.find(l => l.user_id === userReferral?.user_id)?.rank || '-'}
            </div>
            <p className="text-xs text-muted-foreground">On the leaderboard</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>Share this code with friends to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={userReferral?.referral_code || 'Loading...'}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button onClick={copyReferralLink} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Earn $10 for every friend who signs up using your referral code
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Have a Referral Code?</CardTitle>
              <CardDescription>Enter a referral code to get started with a bonus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter referral code"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button onClick={handleApplyCode} disabled={applying}>
                  {applying ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">1. Share Your Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral code with friends
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">2. They Sign Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Your friends create an account using your code
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">3. Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive $10 for each successful referral
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          {conversions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground text-center">
                  Share your referral code to start earning rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            conversions.map((conversion) => (
              <Card key={conversion.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">
                      Referral via {conversion.referral_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${conversion.reward_amount.toFixed(2)}
                    </p>
                    <Badge variant={conversion.status === 'completed' ? 'default' : 'secondary'}>
                      {conversion.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          {rewards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
                <p className="text-muted-foreground text-center">
                  Start referring friends to earn rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    {reward.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-semibold capitalize">
                        {reward.reward_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reward.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-green-600">
                        ${reward.amount.toFixed(2)}
                      </p>
                      <Badge variant={reward.status === 'paid' ? 'default' : 'secondary'}>
                        {reward.status}
                      </Badge>
                    </div>
                    {reward.status === 'pending' && (
                      <Button size="sm" onClick={() => claimReward(reward.id)}>
                        Claim
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>See who's earning the most from referrals</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Leaderboard is empty
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg w-8">#{entry.rank}</div>
                        <div>
                          <p className="font-semibold font-mono">{entry.referral_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.total_referrals} referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${entry.total_earnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};