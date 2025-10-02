import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Coins, DollarSign, Percent } from 'lucide-react';

interface DeFiStatsOverviewProps {
  totalTVL: number;
  totalPools: number;
  userPositions: number;
  totalRewards: number;
}

export const DeFiStatsOverview = ({ 
  totalTVL, 
  totalPools, 
  userPositions, 
  totalRewards 
}: DeFiStatsOverviewProps) => {
  const stats = [
    {
      label: 'Total Value Locked',
      value: `$${(totalTVL / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      label: 'Available Pools',
      value: totalPools,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Your Positions',
      value: userPositions,
      icon: Coins,
      color: 'text-purple-600',
    },
    {
      label: 'Total Rewards Earned',
      value: `$${totalRewards.toFixed(2)}`,
      icon: Percent,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
