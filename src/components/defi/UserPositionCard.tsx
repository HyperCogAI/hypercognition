import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Coins, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface UserPositionCardProps {
  position: {
    id: string;
    amount_deposited: number;
    rewards_earned: number;
    last_claim_at: string;
    pool?: {
      name: string;
      type: string;
      base_token: string;
      quote_token: string;
      rewards_token: string;
      apy: number;
    };
  };
  onClaimRewards: (positionId: string) => Promise<void>;
}

export const UserPositionCard = ({ position, onClaimRewards }: UserPositionCardProps) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaimRewards(position.id);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {position.pool?.name}
          </CardTitle>
          <Badge variant="outline">
            {position.pool?.type === 'yield_farming' ? 'Farming' : 'Mining'}
          </Badge>
        </div>
        <CardDescription>
          {position.pool?.base_token}/{position.pool?.quote_token}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Deposited</span>
            <div className="text-lg font-semibold">
              ${position.amount_deposited.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Rewards</span>
            <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
              <Coins className="h-4 w-4" />
              {position.rewards_earned.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <span>APY: {position.pool?.apy.toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              Last claim: {position.last_claim_at 
                ? formatDistanceToNow(new Date(position.last_claim_at), { addSuffix: true })
                : 'Never'}
            </span>
          </div>
        </div>

        <Button 
          onClick={handleClaim}
          disabled={position.rewards_earned <= 0 || isClaiming}
          className="w-full"
          variant={position.rewards_earned > 0 ? 'default' : 'secondary'}
        >
          {isClaiming ? 'Claiming...' : position.rewards_earned > 0 ? 'Claim Rewards' : 'No Rewards Available'}
        </Button>
      </CardContent>
    </Card>
  );
};
