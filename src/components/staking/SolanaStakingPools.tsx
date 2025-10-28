import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CyberButton } from '@/components/ui/cyber-button';
import { Lock, Droplet, Zap, Sprout } from 'lucide-react';

interface StakingPool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  apy: string;
  tvl: string;
  minStake: string;
  lockPeriod: string;
  risk: 'Low' | 'Medium' | 'High';
  comingSoon?: boolean;
}

const stakingPools: StakingPool[] = [
  {
    id: '1',
    name: 'Native SOL Staking',
    icon: Lock,
    apy: '7.2%',
    tvl: '$2.4B',
    minStake: '0.01 SOL',
    lockPeriod: '2-3 days',
    risk: 'Low',
  },
  {
    id: '2',
    name: 'Liquid Staking (mSOL)',
    icon: Droplet,
    apy: '6.8%',
    tvl: '$890M',
    minStake: '0.01 SOL',
    lockPeriod: 'None',
    risk: 'Low',
    comingSoon: true,
  },
  {
    id: '3',
    name: 'DeFi Staking Pool',
    icon: Zap,
    apy: '12.5%',
    tvl: '$145M',
    minStake: '1 SOL',
    lockPeriod: '7 days',
    risk: 'Medium',
    comingSoon: true,
  },
  {
    id: '4',
    name: 'Yield Farming',
    icon: Sprout,
    apy: '18.3%',
    tvl: '$67M',
    minStake: '5 SOL',
    lockPeriod: '30 days',
    risk: 'High',
    comingSoon: true,
  },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'High':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const SolanaStakingPools = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Available Staking Pools</h3>
        <p className="text-sm text-muted-foreground">
          Choose from multiple staking strategies to maximize your rewards
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stakingPools.map((pool) => {
          const Icon = pool.icon;
          return (
            <Card key={pool.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{pool.name}</CardTitle>
                      <CardDescription className="text-sm">APY: {pool.apy}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={getRiskColor(pool.risk)}>
                    {pool.risk}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">TVL</p>
                    <p className="font-semibold">{pool.tvl}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Stake</p>
                    <p className="font-semibold">{pool.minStake}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Lock Period</p>
                    <p className="font-semibold">{pool.lockPeriod}</p>
                  </div>
                </div>
                <CyberButton 
                  className="w-full" 
                  disabled={pool.comingSoon}
                >
                  {pool.comingSoon ? 'Coming Soon' : 'Stake Now'}
                </CyberButton>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
