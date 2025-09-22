import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Users, Gift, Plus, Award } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

export const ReferralDashboard = () => {
  const { 
    referralCodes, 
    referrals, 
    totalEarnings, 
    loading, 
    generateReferralCode, 
    deactivateReferralCode, 
    claimReward 
  } = useReferrals();
  
  const [maxUses, setMaxUses] = useState('');
  const [rewardPercentage, setRewardPercentage] = useState('5');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleGenerateCode = async () => {
    const uses = maxUses ? parseInt(maxUses) : undefined;
    const percentage = parseFloat(rewardPercentage);
    await generateReferralCode(uses, percentage);
    setMaxUses('');
    setRewardPercentage('5');
  };

  const pendingRewards = referrals.filter(r => !r.reward_claimed).reduce((sum, r) => sum + r.reward_amount, 0);
  const totalReferred = referrals.length;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading referral data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Referral Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime referral earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingRewards.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ready to claim</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferred}</div>
            <p className="text-xs text-muted-foreground">Users referred</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">My Codes</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Referral Codes</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Referral Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Max Uses (optional)</label>
                    <Input
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reward Percentage</label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={rewardPercentage}
                      onChange={(e) => setRewardPercentage(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleGenerateCode} className="w-full">
                    Generate Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {referralCodes.map((code) => (
              <Card key={code.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">{code.code}</CardTitle>
                    <Badge variant={code.is_active ? "default" : "secondary"}>
                      {code.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {code.reward_percentage}% reward • {code.uses_count} uses
                    {code.max_uses && ` of ${code.max_uses}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(code.code)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    {code.is_active && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deactivateReferralCode(code.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Share this code with friends to earn {code.reward_percentage}% of their trading fees
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {referrals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground text-center">
                  Share your referral codes to start earning rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">
                        Referral via {referral.referral_code}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">
                        ${referral.reward_amount.toFixed(2)}
                      </div>
                      {referral.reward_claimed ? (
                        <Badge variant="secondary">Claimed</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => claimReward(referral.id)}
                        >
                          Claim
                        </Button>
                      )}
                    </div>
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