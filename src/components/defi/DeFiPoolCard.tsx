import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Droplets, Info } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DeFiPoolCardProps {
  pool: {
    id: string;
    name: string;
    type: string;
    base_token: string;
    quote_token: string;
    rewards_token: string;
    apy: number;
    tvl: number;
  };
  onDeposit: (poolId: string, amount: number) => Promise<void>;
}

export const DeFiPoolCard = ({ pool, onDeposit }: DeFiPoolCardProps) => {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      setIsDepositing(true);
      try {
        await onDeposit(pool.id, depositAmount);
        setAmount('');
      } finally {
        setIsDepositing(false);
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {pool.type === 'yield_farming' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <Droplets className="h-5 w-5 text-blue-500" />
            )}
            <CardTitle className="text-lg">{pool.name}</CardTitle>
          </div>
          <Badge variant={pool.type === 'yield_farming' ? 'default' : 'secondary'}>
            {pool.type === 'yield_farming' ? 'Yield Farming' : 'Liquidity Mining'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          {pool.base_token}/{pool.quote_token}
          <span className="mx-1">•</span>
          <span className="text-xs">Rewards: {pool.rewards_token}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>APY</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Annual Percentage Yield</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-xl font-bold text-green-600">
              {pool.apy.toFixed(2)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>TVL</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Total Value Locked</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-xl font-bold">
              ${(pool.tvl / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <Input
            type="number"
            placeholder="Amount to deposit"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
          <Button 
            onClick={handleDeposit}
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0 || isDepositing}
          >
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
